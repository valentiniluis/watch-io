import db from '../model/db.js';
import { movieIdSchema, movieSchema, ratingSchema } from '../util/validationSchemas.js';
import { PG_UNIQUE_ERR } from '../util/constants.js';
import { throwError } from '../util/util-functions.js';


export const getRatings = async (req, res, next) => {
  try {
    const { user } = req;
    const { movieId } = req.query;

    const queryArgs = [user.id];
    let query = `
      SELECT
      FROM movie_rating AS rt
      INNER JOIN movie AS mov
      ON rt.movie_id = mov.id
      WHERE rt.user_id = $1
    `;

    if (movieId) {
      query += ' AND rt.movie_id = $2;';
      queryArgs.push(movieId);
    }
    else query += ';';

    const { rows: result } = await db.query(query, queryArgs);

    return res.status(200).json({ success: true, message: "Rating(s) retrieved successfully", ratings: result });
  } catch (err) {

  }
}


export const postRating = async (req, res, next) => {
  try {
    const { value: movie, error: movieError } = movieSchema.validate(req.params.movie);
    if (movieError) throwError(400, 'Invalid movie: ' + movieError.message);

    const { ratingValue, ratingError } = ratingSchema.validate(req.body.rating);
    if (ratingError) throwError(400, 'Invalid rating: ' + ratingError.message);


    const { movieId, title, poster_path, year, tmdb_rating } = ratingValue;
    const args = [movieId, title, poster_path, year, tmdb_rating.toFixed(2)];
    const query = `
      INSERT INTO
      movie(id, title, poster_path, year, tmdb_rating)
      VALUES
      ($1, $2, $3, $4, $5);
    `;
    await tryInsert(query, args);

    const { score, headline, note } = movie;
    const { user } = req;

    await db.query(`
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