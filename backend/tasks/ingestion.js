import cron from 'node-cron';
import { tryInsert } from '../util/db-util.js';
import { MIN_RATING, MIN_VOTES } from '../util/constants.js';
import tmdbAPI from '../api/tmdb-api.js';
import { fetchAndSanitizeMovies } from '../util/api-util.js';

// inserting newly released movies to the database. shouldn't take longer than a few seconds
async function ingestRecentMovies() {
  const now = new Date();
  console.log(now.toISOString() + " - [ingestion task]: Starting task.");

  now.setMonth(now.getMonth() - 3);
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  // try to get movies that meet the requirements from the last 3 months
  const url = `/discover/movie?include_adult=false&language=en-US&vote_count.gte=${MIN_VOTES}&vote_average.gte=${MIN_RATING}&primary_release_date.gte=${dateStr}`;

  async function getPages() {
    try {
      const response = await tmdbAPI.get(url);
      const data = response.data;
      const { total_pages } = data;
      if (!total_pages) throw new Error();
      return total_pages;
    } catch (err) {
      console.error(new Date().toISOString() + ' - [ingestion task]: Failed to get number of pages; execution canceled.');
      return null;
    }
  }

  const pages = await getPages();
  if (!pages) return;

  let successCount = 0;
  const movie_statement = `
    INSERT INTO movie(id, title, poster_path, year, tmdb_rating)
    VALUES ($1, $2, $3, $4, $5);
  `;

  const genre_statement = `
    INSERT INTO movie_genre(movie_id, genre_id)
    VALUES ($1, $2);
  `;

  for (let page = 1; page <= pages; page++) {
    try {
      const movies = await fetchAndSanitizeMovies(url + '&page=' + page);

      // try to insert one by one. If it's duplicate, db trigger catches it.
      movies.forEach(async (movie) => {
        // should be a transaction as well
        const { id, title, poster_path, year, tmdb_rating } = movie;
        if (!id || !title) return;
        const args = [id, title, poster_path, (year === 'N/A') ? null : year, (tmdb_rating === 'N/A') ? null : tmdb_rating];
        const error = await tryInsert(movie_statement, args);
        if (error) return;
        successCount++;
        const genres = movie.genre_ids;
        if (Array.isArray(genres)) genres.forEach(async (genre) => tryInsert(genre_statement, [id, genre]));
        console.log(genres);
      });
    } catch (err) {
      console.log(new Date().toISOString() + ' - [ingestion task]: Failed to get movie page #' + page);
      console.log(err);
    }
  }

  console.log(new Date().toISOString() + ' - [ingestion task]: Ending task; ' + successCount + " movie(s) added successfully.");
}


export default function scheduleJobs() {
  // runs every 1st and 15th of the month at 12 AM
  cron.schedule('0 0 1,15 * *', ingestRecentMovies);
}