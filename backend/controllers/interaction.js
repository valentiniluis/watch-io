import pool from '../model/postgres.js';
import { getInteraction, getPagesAndClearData } from '../util/db-util.js';
import { mediaSchema, interactionSchema, interactionTypeValidation, mediaIdValidation, mediaTypeValidation } from '../util/validationSchemas.js';
import { calculateOffset, deleteInteractionMessage, postInteractionMessage, throwError, validatePage } from '../util/util-functions.js';
import { MOVIES, PG_UNIQUE_ERR, URL_SEGMENT_TO_CONSTANT_MAPPING } from '../util/constants.js';


// get all user interactions
export const getInteractions = async (req, res, next) => {
  try {
    const { user } = req;

    const { error: mediaError, value: mediaType } = mediaTypeValidation.validate(req.params.mediaType);
    if (mediaError) throwError(400, 'Invalid media type: ' + mediaError.message);

    const { value: interactionType, error: interactionErr } = interactionTypeValidation.validate(req.query.interactionType);
    if (interactionErr) throwError(400, 'Invalid interaction type: ' + interactionErr.message);

    const mappedMediaType = URL_SEGMENT_TO_CONSTANT_MAPPING[mediaType];
    const [page, limit] = validatePage(req.query.page, req.query.limit);

    const offset = calculateOffset(page, limit);
    const queryArgs = [user.id, mappedMediaType, limit, offset];
    let query = `
      SELECT 
        ity.interaction_type, 
        med.tmdb_id AS id,
        med.title,
        med.original_title,
        med.original_language,
        med.poster_path,
        med.release_year,
        ROUND(med.tmdb_rating, 1) AS tmdb_rating, 
        COUNT(*) OVER() AS row_count
      FROM interaction AS itr
      INNER JOIN media AS med
      ON itr.media_id = med.id
      INNER JOIN interaction_type AS ity
      ON itr.inter_type_id = ity.id
      WHERE itr.user_id = $1
      AND med.type_id = (SELECT id FROM media_type WHERE media_name = $2)
    `;

    if (interactionType) {
      query += ' AND ity.interaction_type = $5';
      queryArgs.push(interactionType);
    }

    query += ' LIMIT $3 OFFSET $4;';

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
    const { interactionType, mediaId, mediaType } = value;
    const mappedMediaType = URL_SEGMENT_TO_CONSTANT_MAPPING[mediaType];

    await pool.query(`
      INSERT INTO
      interaction(media_id, user_id, inter_type_id)
      VALUES 
      (
        (SELECT id FROM media WHERE type_id = (SELECT id FROM media_type WHERE media_name = $1) AND tmdb_id = $2), 
        $3, 
        (SELECT id FROM interaction_type WHERE interaction_type = $4)
      );`,
      [mappedMediaType, mediaId, user.id, interactionType]
    );

    const message = postInteractionMessage(interactionType);
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

    const { error, value: tmdbId } = mediaIdValidation.required().validate(req.params.mediaId);
    if (error) throwError(400, 'Invalid movie id provided: ' + error.message);

    const userId = user.id;
    const interaction = await getInteraction({ userId, tmdbId, mediaType: MOVIES });
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
    const { error, value } = mediaSchema.validate(req.params);
    if (error) throwError(400, 'Invalid Input: ' + error.message);

    const { mediaType, mediaId } = value;
    const mappedMediaType = URL_SEGMENT_TO_CONSTANT_MAPPING[mediaType];

    const { rowCount, rows } = await pool.query(`
      DELETE FROM interaction
      WHERE user_id = $1
      AND media_id = (
        SELECT id FROM media 
        WHERE tmdb_id = $2 
        AND type_id = (SELECT id FROM media_type WHERE media_name = $3)
      )
      RETURNING (
        SELECT interaction_type 
        FROM interaction_type 
        WHERE id = interaction.inter_type_id
      ) AS interaction_type;`,
      [user.id, mediaId, mappedMediaType]
    );

    if (rowCount === 0) throwError(401, `User has no '${interactionType}' interaction with movie.`);

    let message = 'Interaction deleted successfully!';
    if (rows.length === 1) {
      const [interaction] = rows;
      const { interaction_type } = interaction;
      message = deleteInteractionMessage(interaction_type);
    }    

    return res.status(200).json({ success: true, message });
  } catch (err) {
    next(err);
  }
}