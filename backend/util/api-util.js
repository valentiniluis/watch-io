import tmdbAPI from '../api/tmdb-api.js';
import { getGenreId, getReleaseYear } from './util-functions.js';

const TMDB_IMAGE_PATH = 'https://image.tmdb.org/t/p';

export function getFullPosterPath(posterPath) {
  return (posterPath && posterPath.length > 0) ? `${TMDB_IMAGE_PATH}/w500${posterPath}` : null;
}


export function getFullLogoPath(logoPath) {
  return (logoPath && logoPath.length > 0) ? `${TMDB_IMAGE_PATH}/original${logoPath}` : null;
}


export function fillAllLogoPaths(providers) {
  if (!providers) return;

  if (typeof providers !== 'object') throw Error('Unexpected argument, unable to fill logo paths.');

  const entries = Object.entries(providers);

  entries.forEach(([key, providerArray]) => {
    if (Array.isArray(providerArray)) providers[key] = mapPaths(providerArray, 'logo_path', getFullLogoPath);
  });
}


export function mapPaths(array, key, cb) {
  return array.map(item => ({ ...item, [key]: cb(item[key]) }));
}


export async function fetchAndSanitizeMovies(url) {
  const response = await tmdbAPI.get(url);
  const data = response.data;
  if (!data.results) throw new Error('Failed to load movies');
  const movies = data.results.map(item => ({
    ...item,
    poster_path: getFullPosterPath(item.poster_path),
    release_year: getReleaseYear(item.release_date),
    tmdb_rating: (item.vote_average) ? item.vote_average.toFixed(1) : 'N/A'
  }));
  movies.sort((a, b) => b?.vote_average - a?.vote_average);
  return movies;
}


export async function searchMovie(movie, page = 1) {
  const url = `/search/movie?query=${movie}&page=${page}`;
  fetchAndSanitizeMovies(url);
}


export async function discoverMoviesByGenre(genre, page = 1) {
  const genreId = getGenreId(genre);
  if (genreId === -1) throw new Error('Genre not found.');
  const url = `/discover/movie?include_adult=false&language=en-US&with_genres=${genreId}&page=${page}&vote_count.gte=300&vote_average.gte=5`;
  fetchAndSanitizeMovies(url);
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
    release_year: data.Year,
    imdb_rating: data.imdbRating,
    imdb_votes: data.imdb_votes
  };
}


export async function fetchMovie(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits,keywords`;
  const response = await tmdbAPI.get(url);
  const data = response.data;
  return data;
}


export function sanitizeMovie(movie) {
  const { 
    genres, id, original_language, original_title, 
    title, overview, poster_path, release_date, runtime, 
    tagline, vote_average, credits, keywords: nestedKeywords
  } = movie;

  const { cast, crew } = credits;
  const { keywords } = nestedKeywords;

  const data = {
    genres,
    id,
    original_language,
    original_title,
    title,
    overview,
    poster_path: getFullPosterPath(poster_path),
    release_date: getReleaseYear(release_date),
    runtime: getRuntimeString(runtime),
    tagline,
    tmdb_rating: vote_average,
    cast,
    crew,
    keywords
  };

  return data;
}