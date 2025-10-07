import tmdbAPI from '../api/tmdb-api.js';
import { getGenreId, getReleaseYear } from './util-functions.js';


export function getFullPosterPath(posterPath) {
  return (posterPath && posterPath.length > 0) ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
}


export function mapPosterPaths(movieArray) {
  return movieArray.map(movie => ({ ...movie, poster_path: getFullPosterPath(movie.poster_path) }));
}


export async function searchMovie(movie, page = 1) {
  const url = `/search/movie?query=${movie}&page=${page}`;
  const response = await tmdbAPI.get(url);
  const data = response.data;
  if (!data.results) throw new Error('Failed to load movies');
  const movies = data.results.map(item => ({
    ...item,
    year: getReleaseYear(item.release_date),
    tmdb_rating: (item.vote_average) ? item.vote_average.toFixed(1) : 'N/A'
  }));
  movies.sort((a, b) => b?.vote_average - a?.vote_average);
  const moviesWithPosters = mapPosterPaths(movies);
  return moviesWithPosters;
}


export async function discoverMoviesByGenre(genre, page = 1) {
  const genreId = getGenreId(genre);
  if (genreId === -1) throw new Error('Genre not found.');
  const url = `/discover/movie?include_adult=false&language=en-US&with_genres=${genreId}&page=${page}&vote_count.gte=300&vote_average.gte=5`;
  const response = await tmdbAPI.get(url);
  const data = response.data;
  if (!data.results) throw new Error('Failed to load movies');
  const movies = data.results.map(item => ({
    ...item,
    year: getReleaseYear(item.release_date),
    tmdb_rating: (item.vote_average) ? item.vote_average.toFixed(1) : 'N/A'
  }));
  movies.sort((a, b) => b?.vote_average - a?.vote_average);
  const moviesWithPosters = mapPosterPaths(movies);
  return moviesWithPosters;
}


export function getRuntimeString(totalMinutes) {
  if (!totalMinutes) return 'N/A';
  const runtimeHours = Math.floor(totalMinutes / 60);
  const runtimeMinutes = totalMinutes % 60;
  return `${runtimeHours}h${runtimeMinutes}min`
}


export function filterOMDBData(data) {
  return {
    actors: data.Actors,
    awards: data.Awards,
    director: data.Director,
    metascore: data.Metascore,
    plot: data.Plot,
    rated: data.Rated,
    ratings: data.Ratings,
    year: data.Year,
    imdb_rating: data.imdbRating,
    imdb_votes: data.imdb_votes
  };
}
