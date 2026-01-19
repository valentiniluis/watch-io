import pool from '../model/postgres.js';
import { mediaIdValidation, ratingSchema } from '../util/validationSchemas.js';
import { PG_UNIQUE_ERR, URL_SEGMENT_TO_CONSTANT_MAPPING } from '../util/constants.js';
import { throwError, calculateOffset, validatePage } from '../util/util-functions.js';
import { getPagesAndClearData } from '../util/db-util.js';


export const getRatings = async (req, res, next) => {
  try {
    const { user, mediaType } = req;
    const [page, limit] = validatePage(req.query.page, req.query.limit);
    const offset = calculateOffset(page, limit);

    const queryArgs = [user.id, limit, offset, mediaType];
    let query = `
      SELECT
        med.tmdb_id AS id,
        med.title,
        med.original_title,
        med.original_language,
        med.poster_path,
        med.release_year,
        (SELECT media_name FROM media_type WHERE id = med.type_id) AS media_type,
        ROUND(med.tmdb_rating, 1) AS tmdb_rating, 
        rt.score,
        rt.headline,
        rt.note,
        rt.last_update AS rate_date,
        COUNT(*) OVER() AS row_count
      FROM rating AS rt
      INNER JOIN media AS med
      ON rt.media_id = med.id
      WHERE rt.user_id = $1
      AND type_id = (SELECT id FROM media_type WHERE media_name = $4)
      LIMIT $2 OFFSET $3;
    `;

    const { rows: result } = await pool.query(query, queryArgs);
    const finalData = getPagesAndClearData(result, limit, 'ratings');
    return res.status(200).json({ success: true, message: "Rating(s) retrieved successfully", ...finalData });
  } catch (err) {
    next(err);
  }
}


export const getSingleRating = async (req, res, next) => {
  try {
    const { user, mediaType } = req;

    const { value: mediaId, error: mediaErr } = mediaIdValidation.validate(req.params.mediaId);
    if (mediaErr) throwError(400, 'Invalid media: ' + mediaErr.message);

    const queryArgs = [user.id, mediaId, mediaType];
    let query = `
      SELECT
        med.tmdb_id AS id,
        (SELECT media_name FROM media_type WHERE id = med.type_id) AS media_type,
        rt.score,
        rt.headline,
        rt.note,
        rt.last_update AS rate_date
      FROM rating AS rt
      INNER JOIN media AS med
      ON rt.media_id = med.id
      WHERE rt.user_id = $1
      AND rt.media_id = (
        SELECT id FROM media 
        WHERE tmdb_id = $2
        AND type_id = (SELECT id FROM media_type WHERE media_name = $3)
      );
    `;

    const { rows } = await pool.query(query, queryArgs);

    const finalData = {};
    let message = 'User has not rated this media.';
    if (rows.length > 0) {
      message = 'Rating retrieved successfully.';
      const [rating] = rows;
      finalData.rating = rating;
    }
    finalData.message = message;

    return res.status(200).json({ success: true, ...finalData });
  } catch (err) {
    next(err);
  }
}


export const postRating = async (req, res, next) => {
  try {
    const { user, mediaType } = req;
    
    const { value, error } = ratingSchema.validate(req.body);
    if (error) throwError(400, 'Invalid rating: ' + error.message);
    
    const { mediaId, score, headline, note } = value;

    await pool.query(`
      INSERT INTO
      rating (user_id, media_id, score, headline, note)
      VALUES (
        $1, (
          SELECT id FROM media 
          WHERE tmdb_id = $2 
          AND type_id = (SELECT id FROM media_type WHERE media_name = $3)
        ), $4, $5, $6
      );`,
      [user.id, mediaId, mediaType, score, headline, note]
    );

    return res.status(201).json({ success: true, message: "Movie rated successfully!" });
  } catch (err) {
    if (err.code === PG_UNIQUE_ERR) {
      err.message = "Cannot create rating for media because it already exists. Try editing instead.";
      err.statusCode = 400;
    }
    next(err);
  }
}


export const putRating = async (req, res, next) => {
  try {
    const { user, mediaType } = req;
    const { value, error } = ratingSchema.validate(req.body);
    if (error) throwError(400, 'Invalid rating: ' + error.message);

    const { mediaId, score, headline, note } = value;
    const now = new Date().toISOString();

    await pool.query(`
      UPDATE rating
      SET
      score = $1,
      headline = $2,
      note = $3,
      last_update = $4
      WHERE user_id = $5
      AND media_id = (
        SELECT id FROM media
        WHERE tmdb_id = $6
        AND type_id = (SELECT id FROM media_type WHERE media_name = $7)
      );`,
      [score, headline, note, now, user.id, mediaId, mediaType]
    );

    return res.status(200).json({ success: true, message: "Rating updated successfully." });
  } catch (err) {
    next(err);
  }
}


export const deleteRating = async (req, res, next) => {
  try {
    const { user, mediaType } = req;
    const { value: mediaId, error } = mediaIdValidation.validate(req.params.mediaId);
    if (error) throwError(400, 'Invalid media: ' + error.message);

    const { rowCount } = await pool.query(`
      DELETE FROM rating
      WHERE media_id = (
        SELECT id FROM media
        WHERE tmdb_id = $1
        AND type_id = (SELECT id FROM media_type WHERE media_name = $2)
      )
      AND user_id = $3;`,
      [mediaId, mediaType, user.id]
    );

    if (rowCount === 0) throwError(401, 'User has not rated this media.');

    return res.status(200).json({ success: true, message: "Rating deleted successfully." });
  } catch (err) {
    next(err);
  }
}