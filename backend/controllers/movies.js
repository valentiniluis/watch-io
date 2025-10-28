import tmdbAPI from '../api/tmdb-api.js';
import omdbAPI from '../api/omdb-api.js';
import db from '../model/db.js';
import { getFullPosterPath, getRuntimeString, filterOMDBData } from '../util/api-util.js';
import { discoverMovies, getInteraction, searchMovie } from '../util/db-util.js';
import { getReleaseYear } from '../util/util-functions.js';
import { movieIdSchema, genreIdSchema } from '../util/validationSchemas.js';


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
    const { value, error } = movieIdSchema.validate(req.params);
    const { user } = req;

    if (error) {
      const err = new Error("Invalid Movie: " + error.message);
      err.statusCode = 400;
      throw err;
    }

    const { movieId } = value;
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
      const interactions = await getInteraction({ movieId, userId: user.id });
      
      if (interactions.length) {
        const [interaction] = interactions;
        userData[interaction.type] = true;
      }

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
  try {
    const { value, error } = movieIdSchema.validate(req.params);

    if (error) {
      const err = new Error("Invalid Movie: " + error.message);
      err.statusCode = 400;
      throw err;
    }

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
  const limit = req.query.limit || 30;
  const id = req.user?.id;
  let query;

  try {
    const { error, value } = genreIdSchema.validate(req.params);

    if (error) {
      const err = new Error('Invalid genre ID: ' + error.message);
      err.statusCode = 400;
      throw err;
    }

    const { genreId } = value;
    const queryArgs = [genreId, limit];
    if (id && id.length) {
      query = `
        SELECT mov.*
        FROM movie AS mov
        INNER JOIN movie_genre AS mg
        ON mov.id = mg.movie_id
        WHERE mg.genre_id = $1
        AND mov.id NOT IN (
          SELECT inter.movie_id
          FROM interaction AS inter
          WHERE inter.user_id = $3
          AND inter.type = 'not interested'
        )
        ORDER BY mov.title, mov.tmdb_rating
        LIMIT $2;
      `;
      queryArgs.push(id);
    } else {
      query = `
        SELECT mov.*
        FROM movie AS mov
        INNER JOIN movie_genre AS mg
        ON mov.id = mg.movie_id
        WHERE mg.genre_id = $1
        ORDER BY mov.title, mov.tmdb_rating
        LIMIT $2;
      `;
    }
    const { rows: results } = await db.query(query, queryArgs);
    return res.status(200).json({ success: true, movies: results });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}