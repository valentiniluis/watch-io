import db from '../model/db.js';
import { getInteraction } from '../util/db-util.js';
import { interactionSchema, movieSchema, movieIdSchema } from '../util/validationSchemas.js';


// get all user interactions
export const getInteractions = async (req, res, next) => {
  const { user } = req;
  const { interactionType } = req.query;

  let query = `
    SELECT inter.type, mov.*
    FROM interaction AS inter
    INNER JOIN movie AS mov
    ON inter.movie_id = mov.id
    WHERE inter.user_id = $1
  `;

  const queryArgs = [user.id];

  if (interactionType) {
    query += ' AND inter.type = $2;';
    queryArgs.push(interactionType);
  }
  else query += ';';

  try {
    const { rows: interactions } = await db.query(query, queryArgs);
    return res.status(200).json({ success: true, interactions })
  } catch (err) {
    next(err);
  }
}

// create interaction between user and movie
export const postInteraction = async (req, res, next) => {
  try {
    const { error, value } = movieSchema.validate(req.body);

    if (error) {
      const err = new Error('Invalid Input: ' + error.message);
      err.statusCode = 400;
      throw err;
    }

    const { id: movieId, title, poster_path, year, tmdb_rating } = value;
    const { user } = req;
    const { interactionType } = req.params;

    const { rows } = await db.query(`
      SELECT 1
      FROM movie AS mov
      WHERE mov.id = $1;`,
      [movieId]
    );

    if (rows.length === 0) {
      await db.query(`
        INSERT INTO
        movie(id, title, poster_path, year, tmdb_rating)
        VALUES
        ($1, $2, $3, $4, $5);`,
        [movieId, title, poster_path, year, tmdb_rating.toFixed(2)]
      );
    }

    const interactionQuery = await getInteraction({ movieId, userId: user.id });
    if (interactionQuery.length) {
      const [interaction] = interactionQuery;
      const { type } = interaction;
      const err = new Error(`User already has "${type}" interaction with this movie.`);
      throw err;
    }

    await db.query(`
      INSERT INTO
      interaction(movie_id, user_id, type)
      VALUES ($1, $2, $3);`,
      [movieId, user.id, interactionType]
    );

    let message;
    switch (interactionType) {
      case 'watchlist':
        message = "Movie added to watchlist successfully!";
        break;
      case 'likes':
        message = "Movie added to likes!";
        break;
      case 'uninterested':
        message = "Movie added to uninterested list. This movie won't be recommended to you anymore.";
        break;
    }

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
}

// check if user has interaction with particular movie
export const hasInteraction = async (req, res, next) => {
  try {
    const { error, value } = movieIdSchema.validate(req.params);
    const { user } = req;

    if (error) {
      const err = new Error('Invalid movie id provided. ' + error.message);
      err.statusCode = 400;
      throw err;
    }

    const { movieId } = value;

    const interaction = await getInteraction({ userId: user.id, movieId });
    const hasInteraction = (interaction.length > 0);
    const responseData = { hasInteraction };
    if (hasInteraction) responseData.type = interaction[0].type;

    return res.status(200).json({ success: true, ...responseData });
  } catch (err) {
    next(err);
  }
}


export const deleteInteraction = async (req, res, next) => {
  try {
    const { error, value } = interactionSchema.validate(req.params);
    const { user } = req;

    if (error) {
      const err = new Error('Invalid Input: ' + error.message);
      err.statusCode = 400;
      throw err;
    }

    const { interactionType, movieId } = value;
    const interaction = await getInteraction({ movieId, userId: user.id });

    if (!interaction.length || interaction[0].type !== interactionType) {
      const err = new Error(`User does not have '${interactionType}' interaction with movie`);
      err.statusCode = 400;
      throw err;
    }
    
    await db.query(`
      DELETE FROM interaction AS inter
      WHERE inter.user_id = $1
      AND inter.movie_id = $2
      AND inter.type = $3;`,
      [user.id, movieId, interactionType]
    );

    return res.status(200).json({ success: true, message: `Deleted '${interactionType}' interaction successfully.` });
  } catch (err) {
    next(err);
  }
}