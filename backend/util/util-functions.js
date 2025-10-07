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