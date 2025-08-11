const tmdbAPI = require('../api/tmdb-api');
const omdbAPI = require('../api/omdb-api');

const { getFullPosterPath, getGenreId, getRuntimeString, filterOMDBData } = require('../util/api-util');

exports.getSearchedMovies = async (req, res, next) => {
  const { movie } = req.query;

  try {
    const documentaryId = getGenreId('Documentary');
    const url = (movie)
      ? `/search/movie?query=${movie}&page=1`
      : `/discover/movie?sort_by=vote_average.desc&vote_count.gte=300&without_genres=${documentaryId}`;
    const response = await tmdbAPI.get(url);
    const data = response.data;
    const dataWithPostersPath = {
      ...data,
      results: data.results.map(result => ({ ...result, poster_path: getFullPosterPath(result.poster_path) }))
    };

    res.status(200).json({ success: true, movies: dataWithPostersPath });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}


exports.getMovieData = async (req, res, next) => {
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


exports.getRecommendations = async (req, res, next) => {
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