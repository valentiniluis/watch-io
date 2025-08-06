const tmdbAPI = require('../api/tmdb-api');
const omdbAPI = require('../api/omdb-api');

const { getFullPosterPath, getGenreId, getRuntimeString } = require('../util/api-util');

exports.getSearchedMovies = async (req, res, next) => {
  const { movie } = req.query;

  try {
    const documentaryId = getGenreId('Documentary');
    const url = (movie)
      ? `/search/movie?query=${movie}&page=1,2`
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
    const urlTMDB = `/movie/${movieId}?append_to_response=recommendations`;
    const responseTMDB = await tmdbAPI.get(urlTMDB);
    const dataTMDB = { ...responseTMDB.data };
    dataTMDB.poster_path = getFullPosterPath(dataTMDB.poster_path);
    dataTMDB.recommendations = {
      ...dataTMDB.recommendations,
      results: dataTMDB.recommendations.results.map(rec => ({ ...rec, poster_path: getFullPosterPath(rec.poster_path) }))
    }
    const { imdb_id } = dataTMDB;
    if (!imdb_id) return res.status(200).json({ success: true, movieData: dataTMDB });
    
    const urlOMDB = `/?i=${imdb_id}`;
    const responseOMDB = await omdbAPI.get(urlOMDB);
    const dataOMDB = responseOMDB.data;
    const responseData = { 
      ...dataTMDB,
      runtime: getRuntimeString(dataTMDB.runtime),
      actors: dataOMDB.Actors,
      awards: dataOMDB.Awards,
      director: dataOMDB.Director,
      metascore: dataOMDB.Metascore,
      plot: dataOMDB.Plot,
      rated: dataOMDB.Rated,
      ratings: dataOMDB.Ratings,
      year: dataOMDB.Year,
      imdb_rating: dataOMDB.imdbRating,
      imdb_votes: dataOMDB.imdb_votes
    };

    res.status(200).json({ success: true, movieData: responseData });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}