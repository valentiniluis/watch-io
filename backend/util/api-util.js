import tmdbAPI from '../api/tmdb-api.js';
import omdbAPI from '../api/omdb-api.js';
import { getReleaseYear } from './util-functions.js';
import { URL_SEGMENTS } from './constants.js';

const TMDB_IMAGE_PATH = 'https://image.tmdb.org/t/p';

export function getFullPosterPath(posterPath, width='500') {
  return (posterPath && posterPath.length > 0) ? `${TMDB_IMAGE_PATH}/w${width}${posterPath}` : null;
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


export function getRuntimeString(totalMinutes) {
  if (!totalMinutes) return 'N/A';
  if (totalMinutes < 60) return `${totalMinutes}min`;
  const runtimeHours = Math.floor(totalMinutes / 60);
  const runtimeMinutes = totalMinutes % 60;
  return `${runtimeHours}h${runtimeMinutes}min`
}


export function filterOMDBData(data) {
  return {
    actors: data.Actors,
    director: data.Director,
    awards: data.Awards,
    rated: data.Rated,
    ratings: data.Ratings,
    release_year: data.Year,
    imdb_votes: data.imdb_votes
  };
}


export async function fetchMovie(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits,keywords`;
  const response = await tmdbAPI.get(url);
  const data = response.data;
  return data;
}


export function sanitizeMedia(data, country) {
  if (typeof data !== 'object') throw new Error('Invalid argument. Data must be an object.');

  const {
    genres, id, original_language, overview, poster_path,
    release_date, runtime, tagline, vote_average, credits,
    keywords: keys, external_ids, vote_count, number_of_seasons
  } = data;

  const title = data.title || data.name;
  const original_title = data.original_title || data.original_name;
  const cast = credits?.cast;
  const crew = credits?.crew;
  const keywords = keys?.keywords || keys?.results;
  const imdb_id = data.imdb_id || external_ids?.imdb_id;

  let available = undefined;
  const providers = data['watch/providers'];
  if (providers) {
    available = providers.results[country];
    fillAllLogoPaths(available);
  }

  return {
    id,
    imdb_id,
    title,
    original_title,
    tagline,
    genres,
    original_language,
    overview,
    poster_path: getFullPosterPath(poster_path),
    release_year: getReleaseYear(release_date),
    runtime: getRuntimeString(runtime),
    tmdb_rating: vote_average,
    tmdb_votes: vote_count,
    cast,
    crew,
    keywords,
    available,
    number_of_seasons
  };
}


export async function getAPIMediaData(type, mediaId, country) {
  const urlSegment = getTMDbUrlSegment(type);
  const urlTMDB = `/${urlSegment}/${mediaId}?append_to_response=watch/providers,external_ids`;

  const responseTMDB = await tmdbAPI.get(urlTMDB);
  const dataTMDB = sanitizeMedia(responseTMDB.data, country);

  const { imdb_id } = dataTMDB;
  // if there's no IMDb id, then it's not possible to fetch info from OMDb. Return before OMDb request
  if (!imdb_id) return dataTMDB;

  const urlOMDB = `/?i=${imdb_id}`;
  const responseOMDB = await omdbAPI.get(urlOMDB);
  const dataOMDB = filterOMDBData(responseOMDB.data);
  return {
    ...dataTMDB,
    ...dataOMDB,
  };
}


function getTMDbUrlSegment(type) {
  return URL_SEGMENTS[type];
}


export function sanitizeSeasonData(data) {
  const { air_date, id, name, overview, poster_path, season_number, vote_average } = data;

  let { episodes } = data;
  if (episodes) episodes = episodes.map(episode => ({ 
    ...episode, 
    runtime: getRuntimeString(episode.runtime), 
    still_path: getFullPosterPath(episode.still_path) 
  }));

  const finalData = {
    id,
    name,
    air_date,
    episodes,
    overview,
    poster_path: getFullPosterPath(poster_path),
    season_number,
    tmdb_rating: vote_average
  };

  return finalData;
}


// export async function searchMovie(movie, page = 1) {
//   const url = `/search/movie?query=${movie}&page=${page}`;
//   return fetchAndSanitizeMovies(url);
// }


// export async function discoverMoviesByGenre(genre, page = 1) {
//   const genreId = getGenreId(genre);
//   if (genreId === -1) throw new Error('Genre not found.');
//   const url = `/discover/movie?include_adult=false&language=en-US&with_genres=${genreId}&page=${page}&vote_count.gte=300&vote_average.gte=5`;
//   fetchAndSanitizeMovies(url);
// }