import pool from '../model/postgres.js';
import { movieIdValidation, ratingSchema } from '../util/validationSchemas.js';
import { PG_UNIQUE_ERR } from '../util/constants.js';
import { throwError, calculateOffset, validatePage } from '../util/util-functions.js';
import { getPagesAndClearData } from '../util/db-util.js';


export const getRatings = async (req, res, next) => {
  try {
    const { user } = req;

    const { value: movieId, error: movieIdErr } = movieIdValidation.validate(req.query.movieId);
    if (movieIdErr) throwError(400, 'Invalid movie: ' + movieIdErr.message);

    const [page, limit] = validatePage(req.query.page, req.query.limit);
    const offset = calculateOffset(page, limit);

    const queryArgs = [user.id, limit, offset];
    let query = `
      SELECT *, rt.last_update AS rate_date, COUNT(*) OVER() AS row_count
      FROM movie_rating AS rt
      INNER JOIN movie AS mov
      ON rt.movie_id = mov.id
      WHERE rt.user_id = $1
    `;

    if (movieId) {
      query += ' AND rt.movie_id = $4';
      queryArgs.push(movieId);
    }

    query += ' LIMIT $2 OFFSET $3;';

    const { rows: result } = await pool.query(query, queryArgs);
    const finalData = getPagesAndClearData(result, limit, 'ratings');
    return res.status(200).json({ success: true, message: "Rating(s) retrieved successfully", ...finalData });
  } catch (err) {
    next(err);
  }
}


export const postRating = async (req, res, next) => {
  try {
    const { user } = req;
    const { value, error } = ratingSchema.validate(req.body);
    if (error) throwError(400, 'Invalid rating: ' + error.message);
    const { movieId, score, headline, note } = value;

    await pool.query(`
      INSERT INTO
      movie_rating (user_id, movie_id, score, headline, note)
      VALUES ($1, $2, $3, $4, $5);`,
      [user.id, movieId, score, headline, note]
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
    const { value, error } = ratingSchema.validate(req.body);
    if (error) throwError(400, 'Invalid rating: ' + error.message);

    const { movieId, score, headline, note } = value;
    const now = new Date().toISOString();

    await pool.query(`
      UPDATE movie_rating
      SET
      score = $1,
      headline = $2,
      note = $3,
      last_update = $4
      WHERE
      movie_id = $5 AND
      user_id = $6;`,
      [score, headline, note, now, movieId, user.id]
    );

    return res.status(200).json({ success: true, message: "Rating updated successfully." });
  } catch (err) {
    next(err);
  }
}


export const deleteRating = async (req, res, next) => {
  try {
    const { user } = req;
    const { error, value: movieId } = movieIdValidation.required().validate(req.params.movieId);
    if (error) throwError(400, 'Invalid movie: ' + error.message);

    const { rowCount } = await pool.query(`
      DELETE FROM movie_rating
      WHERE movie_id = $1 AND
      user_id = $2;`,
      [movieId, user.id]
    );

    if (rowCount === 0) throwError(401, `User has not rated this movie.`);

    return res.status(200).json({ success: true, message: "Rating deleted successfully." });
  } catch (err) {
    next(err);
  }
}