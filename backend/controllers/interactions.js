import pool from '../model/postgres.js';
import { getInteraction, getPagesAndClearData } from '../util/db-util.js';
import { interactionSchema, movieSchema, movieIdSchema, interactionTypeValidation } from '../util/validationSchemas.js';
import { calculateOffset, getInteractionMessage, throwError, validatePage } from '../util/util-functions.js';
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
      SELECT ity.type, mov.*, COUNT(*) OVER() AS row_count
      FROM interaction AS inter
      INNER JOIN movie AS mov
      ON inter.movie_id = mov.id
      INNER JOIN interaction_type AS ity
      ON inter.type_id = ity.id
      WHERE inter.user_id = $1
    `;

    if (interactionType) {
      query += ' AND ity.type = $4';
      queryArgs.push(interactionType);
    }

    query += ' LIMIT $2 OFFSET $3;';

    const { rows: interactions } = await pool.query(query, queryArgs);
    const finalData = getPagesAndClearData(interactions, limit, 'interactions');
    return res.status(200).json({ success: true, ...finalData });
  } catch (err) {
    next(err);
  }
}

// create interaction between user and movie
export const postInteraction = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { error, value } = movieSchema.validate(req.body);
    if (error) throwError(400, 'Invalid Input: ' + error.message);

    const { id: movieId, title, poster_path, year, tmdb_rating } = value;
    const { user } = req;
    const { interactionType } = req.params;

    await client.query("BEGIN");

    try {
      await client.query(`
        INSERT INTO
        movie(id, title, poster_path, year, tmdb_rating)
        VALUES
        ($1, $2, $3, $4, $5);
        `,
        [movieId, title, poster_path, year, tmdb_rating.toFixed(2)]
      );

      // IMPL
      // const values = genre_ids.map((_, index) => `($1, $${index + 2})`).join(', '); 
      // await client.query(`
      //   INSERT INTO
      //   movie_genre(movie_id, genre_id)
      //   VALUES
      //   ${values};
      //   `,
      //   [movieId, genreId ??]
      // );
    } catch (err) {
      // if it's not a 'unique' constraint error, the movie may not be available in the database, causing inconsistency
      if (err && err.code !== PG_UNIQUE_ERR) throw err;
    }

    await client.query(`
      INSERT INTO
      interaction(movie_id, user_id, type)
      VALUES ($1, $2, $3);`,
      [movieId, user.id, interactionType]
    );

    await client.query("COMMIT");

    const message = getInteractionMessage(interactionType);
    res.status(201).json({ success: true, message });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === PG_UNIQUE_ERR) {
      err.message = "User has already interacted with this movie.";
      err.statusCode = 400;
    }
    next(err);
  }
  finally {
    client.release();
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

    const { interactionType, movieId } = value;
    const { rowCount } = await pool.query(`
      DELETE FROM interaction
      WHERE user_id = $1
      AND movie_id = $2
      AND type_id = (SELECT id FROM interaction_type WHERE type = $3);`,
      [user.id, movieId, interactionType]
    );

    if (rowCount === 0) {
      const err = new Error(`User has no '${interactionType}' interaction with movie.`);
      err.statusCode = 401;
      throw err;
    }

    return res.status(200).json({ success: true, message: `Deleted '${interactionType}' interaction successfully.` });
  } catch (err) {
    next(err);
  }
}