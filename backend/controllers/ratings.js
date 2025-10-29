import db from '../model/db';
import { movieIdSchema, ratingSchema } from '../util/validationSchemas';
import { PG_UNIQUE_ERR } from '../util/constants';


export const postRating = async (req, res, next) => {
  try {
    const { value: movieIdObj, error: movieIdErr } = movieIdSchema.validate(req.params);

    if (movieIdErr) {
      const err = new Error('Invalid movie id: ' + movieIdErr.message);
      err.statusCode = 400;
      throw err;
    }

    const { value, error } = ratingSchema.validate(req.body);

    if (error) {
      const err = new Error('Invalid input: ' + error.message);
      err.statusCode = 400;
      throw err;
    }

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