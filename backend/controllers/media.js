import pool from '../model/postgres.js';
import { getAPIMediaData } from '../util/api-util.js';
import { throwError, validatePage } from '../util/util-functions.js';
import { LIKE } from '../util/constants.js';
import { 
  genreIdValidation, 
  orderByValidation, 
  countryValidation, 
  mediaIdValidation, 
  limitValidation 
} from '../util/validationSchemas.js';
import {
  discoverMedia,
  getGenres,
  getInteraction,
  getMediaByGenreQuery,
  getPagesAndClearData,
  searchMedia,
  getMovieBasedRecommendationQuery,
  getUserBasedRecommendationQuery
} from '../util/db-util.js';


export const getSearchedMedia = async (req, res, next) => {
  try {
    const { user, mediaType } = req;
    const [page, limit] = validatePage(req.query.page, req.query.limit);
    const { title } = req.query;

    const data = (title)
      ? await searchMedia({ title, mediaType, page, user, limit })
      : await discoverMedia({ page, mediaType, user, limit })
      ;

    const mediaString = req.params[0];
    const finalData = getPagesAndClearData(data, limit, mediaString);
    res.status(200).json({ success: true, ...finalData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMediaData = async (req, res, next) => {
  try {
    const { user, mediaType } = req;
    const userId = user?.id;

    const { value: tmdbId, error } = mediaIdValidation.validate(req.params.mediaId);
    if (error) throwError(400, "Invalid Movie: " + error.message);

    const { value: country, error: countryErr } = countryValidation.validate(req.query.country);
    if (countryErr) throwError(400, 'Invalid country: ' + countryErr.message);

    const responseData = await getAPIMediaData(mediaType, tmdbId, country);
    const userData = {};
    if (user) {
      userData.authenticated = true;
      const interactions = await getInteraction({ tmdbId, userId, mediaType });
      if (interactions.length) {
        const [interaction] = interactions;
        userData[interaction.interaction_type] = true;
      }
    }

    const mediaString = req.params[0];
    res.status(200).json({ success: true, [mediaString]: responseData, user: userData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMediaRecommendations = async (req, res, next) => {
  try {
    const { user, mediaType } = req;

    const { value: mediaId, error: movieErr } = mediaIdValidation.validate(req.params.mediaId);
    if (movieErr) throwError(400, "Invalid Movie: " + movieErr.message);

    const { value: limit, limitErr } = limitValidation.validate(req.query.limit);
    if (limitErr) throwError(400, `Invalid limit: ${limitErr.message}`);

    const userId = (user && user.id) ? user.id : null;

    const [query, args] = getMovieBasedRecommendationQuery({ movieId: mediaId, limit, userId });
    const { rows: recommendations } = await pool.query(query, args);

    res.status(200).json({ success: true, recommendations });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getUserRecommendations = async (req, res, next) => {
  try {
    const { user, mediaType } = req;

    const { value: limit, error } = limitValidation.validate(req.query.limit);
    if (error) throwError(400, `Invalid limit: ${error.message}`);

    // fallback query will be used if the user's not logged in or has no liked/well-rated movies
    // take 250 best rated movies and use random 25 movies sample
    const fallbackQuery = `
      WITH best_rated AS (
        SELECT 
          med.tmdb_id AS id,
          med.title,
          med.original_title,
          med.original_language,
          med.poster_path,
          med.release_year,
          ROUND(tmdb_rating, 1) AS tmdb_rating
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
        AND itr.inter_type_id = (SELECT id FROM interaction_type WHERE interaction_type = '${LIKE}')
        UNION ALL
        SELECT 1
        FROM rating
        WHERE user_id = $1
        AND score >= 7;`,
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


export const getMediaGenres = async (req, res, next) => {
  try {
    const { mediaType } = req;
    const genres = await getGenres(mediaType);
    res.status(200).json({ success: true, genres });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMediaByGenre = async (req, res, next) => {
  try {
    const { user, mediaType } = req;
    const userId = user?.id;

    // guarantee that order by is in the allowed options so there's no injection in the query
    const { value: orderBy, error: orderByError } = orderByValidation.validate(req.query.orderBy);
    if (orderByError) throwError(400, 'Invalid sorting condition: ' + orderByError.message);

    const { error: genreError, value: genreId } = genreIdValidation.validate(req.params.genreId);
    if (genreError) throwError(400, 'Invalid genre: ' + genreError.message);

    const [page, limit] = validatePage(req.query.page, req.query.limit);
    const parameters = { genreId, userId, limit, page };
    const [query, args] = getMediaByGenreQuery(mediaType, orderBy, parameters);

    const { rows: results } = await pool.query(query, args);

    const mediaString = req.params[0];
    const finalData = getPagesAndClearData(results, limit, mediaString);
    return res.status(200).json({ success: true, ...finalData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}