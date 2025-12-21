import pool from '../model/postgres.js';
import { getMediaData } from '../util/api-util.js';
import { discoverMedia, getInteraction, getMovieGenreQuery, getPagesAndClearData, searchMedia } from '../util/db-util.js';
import { getMovieBasedRecommendationQuery, getUserBasedRecommendationQuery, throwError, validatePage } from '../util/util-functions.js';
import { genreIdSchema, orderByValidation, countryValidation, mediaIdValidation, limitValidation } from '../util/validationSchemas.js';
import { MOVIES } from '../util/constants.js';


export const getSearchedMovies = async (req, res, next) => {
  try {
    const { user } = req;
    const [page, limit] = validatePage(req.query.page, req.query.limit);
    const { movie } = req.query;

    const data = (movie)
      ? await searchMedia({ movie, mediaType: MOVIES, page, user, limit })
      : await discoverMedia({ page, mediaType: MOVIES, user, limit })
      ;

    const finalData = getPagesAndClearData(data, limit, 'movies');
    res.status(200).json({ success: true, ...finalData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMovieData = async (req, res, next) => {
  try {
    const { user } = req;
    const { value: movieId, error } = mediaIdValidation.required().validate(req.params.movieId);
    if (error) throwError(400, "Invalid Movie: " + error.message);

    const { value: country, error: countryErr } = countryValidation.validate(req.query.country);
    if (countryErr) throwError(400, 'Invalid country: ' + countryErr.message);

    const responseData = await getMediaData(MOVIES, movieId, country);
    const userData = {};
    if (user) {
      userData.authenticated = true;
      const interactions = await getInteraction({ movieId, userId: user.id });
      if (interactions.length) {
        const [interaction] = interactions;
        userData[interaction.interaction_type] = true;
      }
    }

    res.status(200).json({ success: true, movieData: responseData, user: userData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMovieRecommendations = async (req, res, next) => {
  try {
    const { value: movieId, error: movieErr } = mediaIdValidation.required().validate(req.params.movieId);
    if (movieErr) throwError(400, "Invalid Movie: " + movieErr.message);

    const { value: limit, limitErr } = limitValidation.validate(req.query.limit);
    if (limitErr) throwError(400, `Invalid limit: ${limitErr.message}`);

    const { user } = req;
    const userId = (user && user.id) ? user.id : null;

    const [query, args] = getMovieBasedRecommendationQuery({ movieId, limit, userId });
    const { rows: recommendations } = await pool.query(query, args);

    res.status(200).json({ success: true, recommendations });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getUserRecommendations = async (req, res, next) => {
  try {
    const { value: limit, error } = limitValidation.validate(req.query.limit);
    if (error) throwError(400, `Invalid limit: ${error.message}`);

    const { user } = req;

    // fallback query will be used if the user's not logged in or has no liked/well-rated movies
    // take 250 best rated movies and use random 25 movies sample
    const fallbackQuery = `
      WITH best_rated AS (
        SELECT *, ROUND(tmdb_rating, 1) AS tmdb_rating
        FROM media AS med
        ORDER BY med.tmdb_rating DESC
        LIMIT 250
      )
      SELECT *
      FROM best_rated
      ORDER BY RANDOM()
      LIMIT 25;
    `;

    let result;
    if (!user) {
      result = await pool.query(fallbackQuery);
    } else {
      const { rows } = await pool.query(`
        SELECT 1
        FROM interaction AS itr
        WHERE user_id = $1
        AND itr.type_id = (SELECT id FROM interaction_type WHERE interaction_type = 'like')
        UNION ALL
        SELECT 1
        FROM rating
        WHERE user_id = $1
        AND score >= 7;
        `,
        [user.id]
      );

      if (rows.length === 0) result = await pool.query(fallbackQuery);
      else {
        const [query, args] = getUserBasedRecommendationQuery({ userId: user.id, limit });
        result = await pool.query(query, args);
      }
    }

    const { rows: recommendations } = result;
    res.status(200).json({ success: true, recommendations });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMovieGenres = async (req, res, next) => {
  try {
    const { rows: genres } = await pool.query('SELECT * FROM genre ORDER BY genre_name;');
    res.status(200).json({ success: true, genres });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMoviesByGenre = async (req, res, next) => {
  try {
    const id = req.user?.id;

    // guarantee that order by is in the allowed options so there's no injection in the query
    const { value: orderBy, error: orderByError } = orderByValidation.validate(req.query.orderBy);
    if (orderByError) throwError(400, 'Invalid sorting condition: ' + orderByError.message);

    const { error: genreError, value } = genreIdSchema.validate(req.params);
    if (genreError) throwError(400, 'Invalid genre: ' + genreError.message);

    const [page, limit] = validatePage(req.query.page, req.query.limit);
    const { genreId } = value;
    const parameters = { genreId, userId: id, limit, page };
    const [query, args] = getMovieGenreQuery(orderBy, id?.length > 0, parameters);

    const { rows: results } = await pool.query(query, args);
    const finalData = getPagesAndClearData(results, limit, 'movies');
    return res.status(200).json({ success: true, ...finalData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}