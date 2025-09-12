export function getReleaseYear(releaseDate) {
  if (!releaseDate) return 'N/A';
  return releaseDate.split('-')[0];
}