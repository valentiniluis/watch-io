import db from '../model/db.js';
import { getInteraction, getPagesAndClearData, tryInsert } from '../util/db-util.js';
import { interactionSchema, movieSchema, movieIdSchema, interactionTypeValidation } from '../util/validationSchemas.js';
import { calculateOffset, throwError, validatePage } from '../util/util-functions.js';
import { PG_UNIQUE_ERR } from '../util/constants.js';


// get all user interactions
export const getInteractions = async (req, res, next) => {
  try {
    const { user } = req;

    const { value: interactionType, error: interactionErr } = interactionTypeValidation.validate(req.query.interactionType);
    if (interactionErr) throwError(400, 'Invalid interaction type: ' + interactionErr.message);
    const [page, limit] = validatePage(req.query.page, req.query.limit);

    const offset = calculateOffset(page, limit);
    const queryArgs = [user.id, limit, offset];
    let query = `
      SELECT inter.type, mov.*, COUNT(*) OVER() AS row_count
      FROM interaction AS inter
      INNER JOIN movie AS mov
      ON inter.movie_id = mov.id
      WHERE inter.user_id = $1
    `;

    if (interactionType) {
      query += ' AND inter.type = $4';
      queryArgs.push(interactionType);
    }

    query += ' LIMIT $2 OFFSET $3;';

    const { rows: interactions } = await db.query(query, queryArgs);
    const finalData = getPagesAndClearData(interactions, limit, 'interactions');
    return res.status(200).json({ success: true, ...finalData });
  } catch (err) {
    next(err);
  }
}

// create interaction between user and movie
export const postInteraction = async (req, res, next) => {
  try {
    const { error, value } = movieSchema.validate(req.body);
    if (error) throwError(400, 'Invalid Input: ' + error.message);

    const { id: movieId, title, poster_path, year, tmdb_rating } = value;
    const { user } = req;
    const { interactionType } = req.params;

    const args = [movieId, title, poster_path, year, tmdb_rating.toFixed(2)];
    const query = `
      INSERT INTO
      movie(id, title, poster_path, year, tmdb_rating)
      VALUES
      ($1, $2, $3, $4, $5);
    `;
    await tryInsert(query, args);

    // try to insert. If it goes wrong, trigger catches it
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
        message = "Movie added to not interested list. This movie won't be recommended to you anymore.";
        break;
    }

    res.status(201).json({ success: true, message });
  } catch (err) {
    if (err.code === PG_UNIQUE_ERR) {
      err.message = "User has already interacted with this movie.";
      err.statusCode = 400;
    }
    next(err);
  }
}

// check if user has interaction with particular movie
export const hasInteraction = async (req, res, next) => {
  try {
    const { user } = req;
    const { error, value } = movieIdSchema.validate(req.params);
    if (error) throwError(400, 'Invalid movie id provided. ' + error.message);

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
    const { user } = req;
    const { error, value } = interactionSchema.validate(req.params);
    if (error) throwError(400, 'Invalid Input: ' + error.message);

    // try to eliminate this query
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