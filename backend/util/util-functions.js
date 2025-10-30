import data from './movie-genres.json' with { type: 'json' };

export function getReleaseYear(releaseDate) {
  if (!releaseDate) return 'N/A';
  return releaseDate.split('-')[0];
}


export function getGenreId(searchGenre) {
  const { genres } = data;
  const found = genres.find(genre => genre.name === searchGenre);
  return (found) ? found.id : -1;
}


export function throwError(statusCode, message="Sorry, something went wrong.") {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}