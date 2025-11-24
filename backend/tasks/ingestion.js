import cron from 'node-cron';
import { tryInsert } from '../util/db-util.js';
import { MIN_RATING, MIN_VOTES } from '../util/constants.js';
import tmdbAPI from '../api/tmdb-api.js';
import { fetchAndSanitizeMovies } from '../util/api-util.js';


async function ingestRecentMovies() {
  console.log("starting task - " + new Date().toISOString());

  const min_date = new Date();
  min_date.setMonth(min_date.getMonth() - 3);
  const dateStr = `${min_date.getFullYear()}-${String(min_date.getMonth() + 1).padStart(2, '0')}-${String(min_date.getDate()).padStart(2, '0')}`;
  // try to get movies that meet the requirements from the last 3 months
  const url = `/discover/movie?include_adult=false&language=en-US&vote_count.gte=${MIN_VOTES}&vote_average.gte=${MIN_RATING}&primary_release_date.gte=${dateStr}`;

  console.log(url);

  const movie_statement = `
    INSERT INTO movie(id, title, poster_path, year, tmdb_rating)
    VALUES ($1, $2, $3, $4, $5);
  `;

  const genre_statement = `
    INSERT INTO movie_genre(movie_id, genre_id)
    VALUES ($1, $2);
  `;

  async function getPages() {
    try {
      const response = await tmdbAPI.get(url);
      const data = response.data;
      const { total_pages } = data;
      if (!total_pages) throw new Error();
      return total_pages;
    } catch (err) {
      const now = new Date().toISOString();
      console.error(now + ' - getting total pages of ingestion failed - execution canceled.');
      return null;
    }
  }

  const pages = await getPages();
  if (!pages) return;

  for (let page = 1; page <= pages; page++) {
    try {
      const movies = await fetchAndSanitizeMovies(url + '&page=' + page);
      // try to insert one by one. If it's duplicate, db trigger catches it.

      movies.forEach(async (movie) => {
        const { id, title, poster_path, year, tmdb_rating } = movie;
        if (!id || !title) return;
        const args = [id, title, poster_path, (year === 'N/A') ? null : year, (tmdb_rating === 'N/A') ? null : tmdb_rating];
        const error = await tryInsert(movie_statement, args);
        if (error) return;
        const genres = movie.genre_ids;
        if (Array.isArray(genres)) genres.forEach(async (genre) => tryInsert(genre_statement, [id, genre]));
      });
    } catch (err) {
      const now = new Date().toISOString();
      console.log(now + ' - Failed to get movies: page ' + page);
      console.log(err);
    }
  }

  console.log('ending task - ' + new Date().toISOString());
}

// runs every 1st of the month at 12 AM
// '0 0 1 * *'

export default function scheduleJobs() {
  cron.schedule('25 51 18 24 11 *', ingestRecentMovies);
}