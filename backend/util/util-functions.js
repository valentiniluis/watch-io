import { pageValidation, limitValidation } from './validationSchemas.js';
import { DELETE_INTERACTION_MESSAGE, LIKE, MEDIA_TYPES, MOVIES, NOT_INTERESTED, POST_INTERACTION_MESSAGE, RECOMMENDATION_WEIGHTS, URL_SEGMENT_TO_CONSTANT_MAPPING, URL_SEGMENTS } from './constants.js';
import pool from '../model/postgres.js';


export function getReleaseYear(releaseDate) {
  if (!releaseDate || !releaseDate.length) return 'N/A';
  return releaseDate.split('-')[0];
}


export async function getGenreId(searchGenre) {
  const { rows: genres } = await pool.query('SELECT * FROM genre;');
  const found = genres.find(genre => genre.genre_name === searchGenre);
  return (found) ? found.id : -1;
}


export function throwError(statusCode, message = "Sorry, something went wrong.") {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}


export function validatePage(page, limit) {
  const { value: pageValue, error: pageErr } = pageValidation.validate(page);
  if (pageErr) throwError(400, 'Invalid page: ' + pageErr.message);

  const { value: limitValue, error: limitErr } = limitValidation.validate(limit);
  if (limitErr) throwError(400, 'Invalid limit: ', limitErr.message);

  return [pageValue, limitValue];
}


export function calculateOffset(page, limit) {
  const offset = (page - 1) * limit;
  return offset;
}


export function postInteractionMessage(type) {
  return POST_INTERACTION_MESSAGE[type];
}


export function deleteInteractionMessage(type) {
  return DELETE_INTERACTION_MESSAGE[type];
}


export function getRouterPath(filename) {
  let path = '/' + filename;

  // media.js is an exception because its first directive will be used as a route parameter
  if (filename === 'media') return /^\/(movie|tv)/i;

  return path;
}


export function mapUrlMediaToConstant(segment) {
  return URL_SEGMENT_TO_CONSTANT_MAPPING[segment];
}


export function mapConstantToUrlMedia(segment) {
  return URL_SEGMENTS[segment];
}