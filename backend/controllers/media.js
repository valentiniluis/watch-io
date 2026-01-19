import pool from '../model/postgres.js';
import { getAPIMediaData, sanitizeSeasonData } from '../util/api-util.js';
import { throwError, validatePage } from '../util/util-functions.js';
import { LIKE, SERIES, URL_SEGMENTS } from '../util/constants.js';
import { 
  genreIdValidation, 
  orderByValidation, 
  countryValidation, 
  mediaIdValidation, 
  limitValidation, 
  intValidation,
  booleanValidation
} from '../util/validationSchemas.js';
import {
  discoverMedia,
  getGenres,
  getInteraction,
  getMediaByGenreQuery,
  getPagesAndClearData,
  searchMedia,
  getMediaBasedRecommendationQuery,
  getUserBasedRecommendationQuery
} from '../util/db-util.js';
import tmdbApi from '../api/tmdb-api.js';


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
    if (error) throwError(400, "Invalid media: " + error.message);

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
    const userId = user?.id;

    const { value: mediaId, error: mediaErr } = mediaIdValidation.validate(req.params.mediaId);
    if (mediaErr) throwError(400, "Invalid media: " + mediaErr.message);

    const { value: limit, limitErr } = limitValidation.validate(req.query.limit);
    if (limitErr) throwError(400, `Invalid limit: ${limitErr.message}`);

    const [query, args] = getMediaBasedRecommendationQuery({ mediaId, mediaType, limit, userId });
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
    const userId = user?.id;

    const { value: limit, error } = limitValidation.validate(req.query.limit);
    if (error) throwError(400, `Invalid limit: ${error.message}`);

    // fallback query will be used if the user's not logged in or has no liked/well-rated media
    // take 250 best rated media and use random sample
    const fallbackArgs = [mediaType, limit];
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
        WHERE med.type_id = (SELECT id FROM media_type WHERE media_name = $1)
        ORDER BY med.tmdb_rating DESC
        LIMIT 250
      )
      SELECT *
      FROM best_rated
      ORDER BY RANDOM()
      LIMIT $2;
    `;

    let result;
    if (!user) {
      result = await pool.query(fallbackQuery, fallbackArgs);
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

      if (rows.length === 0) result = await pool.query(fallbackQuery, fallbackArgs);
      else {
        const [query, args] = getUserBasedRecommendationQuery({ userId, limit, mediaType });
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

    const { value: limit, error: limitErr } = intValidation.validate(req.query.limit);
    if (limitErr) throwError(400, 'Limit must be a positive integer.');

    const { value: randomize, error: randErr } = booleanValidation.validate(req.query.randomize);
    if (randErr) throwError(400, 'Randomization options are either "true" or "false".');

    const params = { limit, randomize };
    const genres = await getGenres(mediaType, params);
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


export const getSeasonDetails = async (req, res, next) => {
  try {
    const { mediaType } = req;

    if (mediaType !== SERIES) throwError(400, `Invalid media type. Only '${URL_SEGMENTS[SERIES]}' is allowed.`);

    const { value: mediaId, error: mediaErr } = mediaIdValidation.validate(req.params.mediaId);
    if (mediaErr) throwError(400, "Invalid TV Show: " + mediaErr.message);

    const { value: season, error: seasonErr } = intValidation.required().validate(req.params.season);
    if (seasonErr) throwError(400, `Invalid season parameter: ${seasonErr.message}`);
    
    const response = await tmdbApi.get(`/tv/${mediaId}/season/${season}`);
    const data = response.data;
    const finalData = sanitizeSeasonData(data);

    res.status(200).json({ success: true, message: 'Retrieved season details successfully.', season: finalData });
  } catch(err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}