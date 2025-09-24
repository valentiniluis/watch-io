import tmdbAPI from '../api/tmdb-api.js';
import db from '../model/db.js';


export function getFullPosterPath(posterPath) {
  return (posterPath && posterPath.length > 0) ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
}


export function mapPosterPaths(movieArray) {
  return movieArray.map(movie => ({ ...movie, poster_path: getFullPosterPath(movie.poster_path) }));
}


// Dados de 6 mil filmes migrados para o postgres, consulta local
export const discoverMovies = async ({ page = 1, user = {} }) => {
  const offset_amount = (page - 1) * 20;
  const { rows: data } = await db.query(`
    SELECT *
    FROM watchio.movie AS mov
    ORDER BY mov.tmdb_rating DESC, mov.title
    LIMIT 20
    OFFSET $1;
    `,
    [offset_amount]
  );
  return data;
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
