import tmdbAPI from '../api/tmdb-api.js';
import omdbAPI from '../api/omdb-api.js';
import pool from '../model/postgres.js';
import { getFullPosterPath, getRuntimeString, filterOMDBData, fillAllLogoPaths, fetchAndSanitizeMovies, fetchMovie, sanitizeMovie } from '../util/api-util.js';
import { discoverMovies, getInteraction, searchMovie, getMovieGenreQuery, getPagesAndClearData, insertMovie } from '../util/db-util.js';
import { throwError, validatePage } from '../util/util-functions.js';
import { genreIdSchema, orderByValidation, countryValidation, movieIdValidation } from '../util/validationSchemas.js';


export const getSearchedMovies = async (req, res, next) => {
  try {
    const { user } = req;
    const [page, limit] = validatePage(req.query.page, req.query.limit);
    const { movie } = req.query;

    const data = (movie) ? await searchMovie({ movie, page, user, limit }) : await discoverMovies({ page, user, limit });
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
    const { value: movieId, error } = movieIdValidation.required().validate(req.params.movieId);
    if (error) throwError(400, "Invalid Movie: " + error.message);

    let movieData;
    movieData = await fetchMovie(movieId);
    movieData = sanitizeMovie(movieData);
    console.log(movieData);

    const { value: country, error: countryErr } = countryValidation.validate(req.query.country);
    if (countryErr) throwError(400, 'Invalid country: ' + countryErr.message);

    const urlTMDB = `/movie/${movieId}?append_to_response=watch/providers`;
    const responseTMDB = await tmdbAPI.get(urlTMDB);
    const dataTMDB = { ...responseTMDB.data };
    dataTMDB.available = dataTMDB['watch/providers'].results[country];
    fillAllLogoPaths(dataTMDB.available);
    delete dataTMDB['watch/providers'];
    dataTMDB.poster_path = getFullPosterPath(dataTMDB.poster_path);
    dataTMDB.tmdb_rating = dataTMDB.vote_average;
    dataTMDB.tmdb_votes = dataTMDB.vote_count;
    const { imdb_id } = dataTMDB;
    // if there's no id for IMDb, then it's not possible to fetch info from OMDb. The request ends here
    if (!imdb_id) return res.status(200).json({ success: true, movieData: dataTMDB });

    const urlOMDB = `/?i=${imdb_id}`;
    const responseOMDB = await omdbAPI.get(urlOMDB);
    const dataOMDB = filterOMDBData(responseOMDB.data);
    const responseData = {
      ...dataTMDB,
      ...dataOMDB,
      runtime: getRuntimeString(dataTMDB.runtime),
    };

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


export const getRecommendations = async (req, res, next) => {
  try {
    const { value: movieId, error } = movieIdValidation.required().validate(req.params.movieId);
    if (error) throwError(400, "Invalid Movie: " + error.message);
    const urlTMDB = `/movie/${movieId}/recommendations`;
    const recommendations = await fetchAndSanitizeMovies(urlTMDB);
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