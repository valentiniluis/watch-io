import tmdbAPI from '../api/tmdb-api.js';
import omdbAPI from '../api/omdb-api.js';
import db from '../model/db.js';

import { discoverMovies, searchMovie, getFullPosterPath, getRuntimeString, filterOMDBData } from '../util/api-util.js';
import { getReleaseYear } from '../util/util-functions.js';


export const getSearchedMovies = async (req, res, next) => {
  const { user } = req;
  const { movie, page } = req.query;

  try {
    const data = (movie) ? await searchMovie(movie, page) : await discoverMovies({ page, user });
    res.status(200).json({ success: true, movies: data });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


export const getMovieData = async (req, res, next) => {
  const { movieId } = req.params;
  const { user } = req;

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

    const userData = {};
    if (user) {
      const { rows: interactions } = await db.query(`
        SELECT inter.type
        FROM watchio.interaction AS inter
        WHERE inter.user_id = $1
        AND inter.movie_id = $2;
        `,
        [user.id, movieId]
      );
      interactions.forEach(value => userData[value] = true);
      userData.authenticated = true;
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
  const { movieId } = req.params;

  try {
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