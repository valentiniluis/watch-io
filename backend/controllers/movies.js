import tmdbAPI from '../api/tmdb-api.js';
import omdbAPI from '../api/omdb-api.js';
import db from '../model/db.js';
import { getFullPosterPath, getRuntimeString, filterOMDBData } from '../util/api-util.js';
import { discoverMovies, getInteraction, searchMovie, getMovieGenreQuery } from '../util/db-util.js';
import { getReleaseYear, throwError } from '../util/util-functions.js';
import { movieIdSchema, genreIdSchema, orderSchema, limitSchema } from '../util/validationSchemas.js';


// how to paginate?
export const getSearchedMovies = async (req, res, next) => {
  const { user } = req;
  const { movie, page } = req.query;

  try {
    const data = (movie) ? await searchMovie({ movie, page, user }) : await discoverMovies({ page, user });
    res.status(200).json({ success: true, movies: data });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMovieData = async (req, res, next) => {
  try {
    const { user } = req;
    const { value, error } = movieIdSchema.validate(req.params);
    if (error) throwError(400, "Invalid Movie: " + error.message);

    const { movieId } = value;
    const urlTMDB = `/movie/${movieId}`;
    const responseTMDB = await tmdbAPI.get(urlTMDB);
    const dataTMDB = { ...responseTMDB.data };
    dataTMDB.poster_path = getFullPosterPath(dataTMDB.poster_path);
    dataTMDB.tmdb_rating = dataTMDB.vote_average;
    dataTMDB.tmdb_votes = dataTMDB.vote_count;
    const { imdb_id } = dataTMDB;
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
        userData[interaction.type] = true;
      }
    }

    res.status(200).json({ success: true, movieData: responseData, user: userData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}

// frequency counter to find most recommended movie
// not implementer yet. other approach?
export const getRecommendations = async (req, res, next) => {
  try {
    const { value, error } = movieIdSchema.validate(req.params);
    if (error) throwError(400, "Invalid Movie: " + error.message);

    const { movieId } = value;
    const urlTMDB = `/movie/${movieId}/recommendations`;
    const responseTMDB = await tmdbAPI.get(urlTMDB);
    const dataTMDB = { ...responseTMDB.data };
    dataTMDB.results = dataTMDB.results.map(rec => ({
      ...rec,
      poster_path: getFullPosterPath(rec.poster_path),
      year: getReleaseYear(rec.release_date),
      tmdb_rating: (rec.vote_average) ? rec.vote_average.toFixed(1) : 'N/A'
    }));
    res.status(200).json({ success: true, recommendations: dataTMDB.results });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMovieGenres = async (req, res, next) => {
  try {
    const { rows: genres } = await db.query('SELECT * FROM genre ORDER BY name;');
    res.status(200).json({ success: true, genres });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMoviesByGenre = async (req, res, next) => {
  try {
    const id = req.user?.id;
    const { value: limit, error: limitError } = limitSchema.validate(req.query.limit);
    // guarantee that order by is in the allowed options so there's no injection in the query
    const { value: orderBy, error: orderByError } = orderSchema.validate(req.query.orderBy);
    const { error: genreError, value } = genreIdSchema.validate(req.params);

    if (limitError) throwError(400, 'Invalid movie limit: ' + limitError.message);
    if (orderByError) throwError(400, 'Invalid sorting condition: ' + orderByError.message);
    if (genreError) throwError(400, 'Invalid genre: ' + genreError.message);

    const { genreId } = value;
    const queryArgs = [genreId, limit];
    if (id) queryArgs.push(id);
    const query = getMovieGenreQuery(orderBy, id?.length > 0);

    const { rows: results } = await db.query(query, queryArgs);
    return res.status(200).json({ success: true, movies: results });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}