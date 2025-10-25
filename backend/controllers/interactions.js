import db from '../model/db.js';
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
    if (!err.statusCode) err.statusCode = 500;
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
      WHERE mov.id = $1;
    `,
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

    const interactionQuery = await db.query(`
      SELECT type
      FROM interaction AS inter
      WHERE inter.user_id = $1
      AND inter.movie_id = $2; `,
      [user.id, movieId]
    );

    if (interactionQuery.rows.length > 0) {
      const interactedData = interactionQuery.rows;
      const { type } = interactedData[0];
      return res.status(400).json({ success: false, message: 'User has already interacted with this movie.', type });
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
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}

// check if user has interaction with particular movie
export const hasInteraction = async (req, res, next) => {
  try {
    const { error, value } = movieIdSchema.validate(req.params);

    if (error) {
      const err = new Error('Invalid Input: ' + error.message);
      err.statusCode = 400;
      throw err;
    }

    const { movieId } = value;
    const { user } = req;

    if (!movieId) return res.status(400).json({ success: false, message: "No movie id provided" });

    const { rows: interaction } = await db.query(`
      SELECT type 
      FROM interaction AS inter
      WHERE inter.user_id = $1
      AND inter.movie_id = $2; `,
      [user.id, movieId]
    );

    const hasInteraction = (interaction.length > 0);
    const responseData = { hasInteraction };
    if (hasInteraction) responseData.type = interaction[0].type;

    return res.status(200).json({ success: true, ...responseData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const deleteInteraction = async (req, res, next) => {
  try {
    const { error, value } = interactionSchema.validate(req.params);

    if (error) {
      const err = new Error('Invalid Input: ' + error.message);
      err.statusCode = 400;
      throw err;
    }

    const { interactionType, movieId } = value;
    const { user } = req;

    const interaction = await db.query(`
      SELECT 1
      FROM interaction AS inter
      WHERE inter.user_id = $1
      AND inter.movie_id = $2
      AND inter.type = $3; `,
      [user.id, movieId, interactionType]
    );

    if (interaction.rows.length === 0) return res.status(400).json({ success: false, message: `User does not have '${interactionType}' interaction with movie` });

    await db.query(`
      DELETE FROM interaction AS inter
      WHERE inter.user_id = $1
      AND inter.movie_id = $2
      AND inter.type = $3; `,
      [user.id, movieId, interactionType]
    );
    return res.status(200).json({ success: true, message: `Deleted '${interactionType}' interaction successfully.` });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}