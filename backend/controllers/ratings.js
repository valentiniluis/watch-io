import db from '../model/db.js';
import { movieIdSchema, ratingSchema } from '../util/validationSchemas.js';
import { PG_UNIQUE_ERR } from '../util/constants.js';
import { throwError } from '../util/util-functions.js';


export const getRatings = async (req, res, next) => {
  try {
    const { user } = req;

    const query = `
      SELECT
      FROM movie_rating AS rt
      INNER JOIN movie AS mov
      ON rt.movie_id = mov.id
      WHERE rt.user_id = $1;
    `;

    const { rows: result } = await db.query(query, user.id);

    return res.status(200).json({ success: true, message: "Ratings retrieved successfully", ratings: result });
  } catch (err) {

  }
}


export const postRating = async (req, res, next) => {
  try {
    const { value: movieIdObj, error: movieIdErr } = movieIdSchema.validate(req.params);
    if (movieIdErr) throwError(400, 'Invalid movie: ' + movieIdErr.message);

    const { value, error } = ratingSchema.validate(req.body);
    if (error) throwError(400, 'Invalid rating: ' + error.message);

    const { movieId } = movieIdObj;
    const { score, note } = value;
    const { user } = req;

    await db.query(`
      INSERT INTO
      movie_rating (user_id, movie_id, score, note)
      VALUES ($1, $2, $3, $4);`,
      [user.id, movieId, score, note]
    );

    return res.status(201).json({ success: true, message: "Movie rated successfully!" });
  } catch (err) {
    if (err.code === PG_UNIQUE_ERR) {
      err.message = "Cannot create rating for movie because it already exists. Try editing instead.";
      err.statusCode = 400;
    }
    next(err);
  }
}


export const putRating = async (req, res, next) => {
  try {
    const { user } = req;

    const { value: movieIdValue, error: movieIdError } = movieIdSchema.validate(req.params);
    if (movieIdError) throwError(400, 'Invalid movie: ' + movieIdError.message);

    const { value, error } = ratingSchema.validate(req.body);
    if (error) throwError(400, 'Invalid rating:  ' + error.message);

    const { score, note } = value;
    const { movieId } = movieIdValue;
    const now = new Date().toISOString();

    await db.query(`
      UPDATE movie_rating
      SET
      score = $1,
      note = $2,
      last_updated = $3
      WHERE
      movie_id = $4 AND
      user_id = $5;`,
      [score, note, now, movieId, user.id]
    );

    return res.status(200).json({ success: true, message: "Rating updated successfully." });
  } catch (err) {
    next(err);
  }
}


export const deleteRating = async (req, res, next) => {
  try {
    const { error, value } = movieIdSchema.validate(req.params);
    if (error) throwError(400, 'Invalid movie: ' + error.message);
    
    const { movieId } = value;

    await db.query(`
      DELETE FROM movie_rating
      WHERE movie_id = $1 AND
      user_id = $2;`,
      [movieId, user.id]
    );

    return res.status(200).json({ success: true, message: "Rating deleted successfully." });
  } catch (err) {
    next(err);
  }
}