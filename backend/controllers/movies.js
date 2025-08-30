import tmdbAPI from '../api/tmdb-api.js';
import omdbAPI from '../api/omdb-api.js';

import { discoverMovies, searchMovie, mapPosterPaths, getFullPosterPath, getRuntimeString, filterOMDBData } from '../util/api-util.js';


export const getSearchedMovies = async (req, res, next) => {
  const { movie } = req.query;

  try {
    const movies = (movie) ? await searchMovie(movie) : await discoverMovies();
    const moviesWithPosters = mapPosterPaths(movies);
    res.status(200).json({ success: true, movies: moviesWithPosters });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMovieData = async (req, res, next) => {
  const { movieId } = req.params;
  try {
    const urlTMDB = `/movie/${movieId}`;
    const responseTMDB = await tmdbAPI.get(urlTMDB);
    const dataTMDB = { ...responseTMDB.data };
    dataTMDB.poster_path = getFullPosterPath(dataTMDB.poster_path);
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

    res.status(200).json({ success: true, movieData: responseData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getRecommendations = async (req, res, next) => {
  // frequency counter to find most recommended movie
  const { movieId } = req.params;
  try {
    const urlTMDB = `/movie/${movieId}/recommendations`;
    const responseTMDB = await tmdbAPI.get(urlTMDB);
    const dataTMDB = { ...responseTMDB.data };
    dataTMDB.results = dataTMDB.results.map(rec => ({ ...rec, poster_path: getFullPosterPath(rec.poster_path) }));
    res.status(200).json({ success: true, recommendations: dataTMDB.results });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}