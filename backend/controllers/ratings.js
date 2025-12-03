import pool from '../model/postgres.js';
import { movieIdSchema, movieIdValidation, movieSchema, ratingSchema } from '../util/validationSchemas.js';
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
      SELECT *, COUNT(*) OVER() AS row_count
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
  // start postgres client for the upcoming transaction
  const client = await pool.connect();

  try {
    const { user } = req;
    const { value: movieData, error: movieError } = movieSchema.validate(req.body.movie);
    if (movieError) throwError(400, 'Invalid movie: ' + movieError.message);

    const { value: ratingData, error: ratingError } = ratingSchema.validate(req.body.rating);
    if (ratingError) throwError(400, 'Invalid rating: ' + ratingError.message);

    const { id: movieId, title, poster_path, year, tmdb_rating } = movieData;
    const { score, headline, note } = ratingData;

    await client.query('BEGIN');

    try {
      await client.query(`
        INSERT INTO
        movie(id, title, poster_path, year, tmdb_rating)
        VALUES
        ($1, $2, $3, $4, $5);`,
        [movieId, title, poster_path, year, tmdb_rating.toFixed(2)]
      );

      // try to insert genres...
    } catch (err) {
      if (err.code !== PG_UNIQUE_ERR) throwError(500, "Failed to rate movie: " + err.message);
    }

    await client.query(`
      INSERT INTO
      movie_rating (user_id, movie_id, score, headline, note)
      VALUES ($1, $2, $3, $4, $5);`,
      [user.id, movieId, score, headline, note]
    );

    // if all went right, commit the transaction
    await client.query('COMMIT');

    return res.status(201).json({ success: true, message: "Movie rated successfully!" });
  } catch (err) {
    // if the transaction went wrong, rollback
    await client.query("ROLLBACK");
    if (err.code === PG_UNIQUE_ERR) {
      err.message = "Cannot create rating for movie because it already exists. Try editing instead.";
      err.statusCode = 400;
    }
    next(err);
  }
  finally {
    client.release();
  }
}


export const putRating = async (req, res, next) => {
  try {
    const { user } = req;

    const { value: movieIdValue, error: movieIdError } = movieIdSchema.validate(req.params);
    if (movieIdError) throwError(400, 'Invalid movie: ' + movieIdError.message);

    const { value, error } = ratingSchema.validate(req.body);
    if (error) throwError(400, 'Invalid rating: ' + error.message);

    const { score, headline, note } = value;
    const { movieId } = movieIdValue;
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
    const { error, value } = movieIdSchema.validate(req.params);
    if (error) throwError(400, 'Invalid movie: ' + error.message);
    const { movieId } = value;

    await pool.query(`
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