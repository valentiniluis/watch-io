const { genres } = require('./movie-genres.json');


exports.getFullPosterPath = function (posterPath) {
  return (posterPath && posterPath.length > 0) ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
}


exports.mapPosterPaths = function (posterPath) {

}

exports.getGenreId = function (genre) {
  const targetGenre = genres.find(current => current.name === genre);
  if (!targetGenre) return 0;
  return targetGenre.id;
}

exports.getRuntimeString = function(totalMinutes) {
  if (!totalMinutes) return 'N/A';
  const runtimeHours = Math.floor(totalMinutes / 60);
  const runtimeMinutes = totalMinutes % 60;
  return `${runtimeHours}h${runtimeMinutes}min`
}