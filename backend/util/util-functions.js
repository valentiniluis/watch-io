import data from './movie-genres.json' with { type: 'json' };
import { pageValidation, limitValidation } from './validationSchemas.js';

export function getReleaseYear(releaseDate) {
  if (!releaseDate || !releaseDate.length) return 'N/A';
  return releaseDate.split('-')[0];
}


export function getGenreId(searchGenre) {
  const { genres } = data;
  const found = genres.find(genre => genre.name === searchGenre);
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


export function getInteractionMessage(type) {
  let message;
  switch (type) {
    case 'watchlist':
      message = "Movie added to watchlist successfully!";
      break;
    case 'likes':
      message = "Movie added to likes!";
      break;
    case 'uninterested':
      message = "Movie added to not interested list. This movie won't be recommended to you anymore.";
      break;
  }
  return message;
}