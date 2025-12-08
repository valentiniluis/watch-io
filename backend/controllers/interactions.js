import pool from '../model/postgres.js';
import { getInteraction, getPagesAndClearData } from '../util/db-util.js';
import { interactionSchema, interactionTypeValidation, movieIdValidation } from '../util/validationSchemas.js';
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
      SELECT ity.interaction_type, mov.*, ROUND(mov.tmdb_rating, 1) AS tmdb_rating, COUNT(*) OVER() AS row_count
      FROM interaction AS inter
      INNER JOIN movie AS mov
      ON inter.movie_id = mov.id
      INNER JOIN interaction_type AS ity
      ON inter.type_id = ity.id
      WHERE inter.user_id = $1
    `;

    if (interactionType) {
      query += ' AND ity.interaction_type = $4';
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
  try {
    const { error, value } = interactionSchema.validate(req.body);
    if (error) throwError(400, 'Invalid Input: ' + error.message);

    const { user } = req;
    const { interactionType, movieId } = value;

    await pool.query(`
      INSERT INTO
      interaction(movie_id, user_id, type_id)
      VALUES ($1, $2, (SELECT id FROM interaction_type WHERE interaction_type = $3));`,
      [movieId, user.id, interactionType]
    );

    const message = getInteractionMessage(interactionType);
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
    const { error, value: movieId } = movieIdValidation.required().validate(req.params.movieId);
    if (error) throwError(400, 'Invalid movie id provided: ' + error.message);

    const interaction = await getInteraction({ userId: user.id, movieId });
    const hasInteraction = (interaction.length > 0);
    const responseData = { hasInteraction };
    if (hasInteraction) responseData.type = interaction[0].interaction_type;

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
      AND type_id = (SELECT id FROM interaction_type WHERE interaction_type = $3);`,
      [user.id, movieId, interactionType]
    );

    if (rowCount === 0) throwError(401, `User has no '${interactionType}' interaction with movie.`);

    return res.status(200).json({ success: true, message: `Deleted '${interactionType}' interaction successfully.` });
  } catch (err) {
    next(err);
  }
}