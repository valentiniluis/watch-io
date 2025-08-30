import movieGenres from './movie-genres.json' with { type: 'json' };
const { genres } = movieGenres;
import tmdbAPI from '../api/tmdb-api.js';


export function getFullPosterPath(posterPath) {
  return (posterPath && posterPath.length > 0) ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
}


export function mapPosterPaths(movieArray) {
  return movieArray.map(movie => ({ ...movie, poster_path: getFullPosterPath(movie.poster_path) }));
}


export const discoverMovies = async () => {
  const documentaryId = getGenreId('Documentary');
  const url = `/discover/movie?sort_by=vote_average.desc&vote_count.gte=300&without_genres=${documentaryId}`
  const response = await tmdbAPI.get(url);
  const data = response.data;
  if (!response.data.results) throw new Error('Failed to load movies');
  return data.results;
}


export async function searchMovie(movie) {
  const url = `/search/movie?query=${movie}&page=1`;
  const response = await tmdbAPI.get(url);
  const data = response.data;
  if (!data.results) throw new Error('Failed to load movies');
  const movies = [...data.results];
  movies.sort((a, b) => b?.popularity - a?.popularity);
  return movies;
}


export function getGenreId(genre) {
  const targetGenre = genres.find(current => current.name === genre);
  if (!targetGenre) return 0;
  return targetGenre.id;
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
