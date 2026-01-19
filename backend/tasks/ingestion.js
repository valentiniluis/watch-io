import cron from 'node-cron';
import { MIN_RATING, MIN_VOTES } from '../util/constants.js';
import tmdbAPI from '../api/tmdb-api.js';
import { fetchAndSanitizeMovies, fetchMovie, sanitizeMedia } from '../util/api-util.js';
import { insertMovie } from '../util/db-util.js';

// IMPL - fix logic for ingesting series as well

// inserting newly released media to the database. shouldn't take longer than a few seconds
async function ingestRecentMovies() {
  const now = new Date();
  console.log(now.toISOString() + " - [ingestion task]: Starting task.");

  now.setMonth(now.getMonth() - 3);
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  // try to get media that meet the requirements from the last 3 months
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

  for (let page = 1; page <= pages; page++) {
    try {
      const movies = await fetchAndSanitizeMovies(url + '&page=' + page);
      
      movies.forEach(async (movie) => {
        const data = await fetchMovie(movie.id);
        const sanitizedMovie = sanitizeMedia(data);
        const error = await insertMovie(sanitizedMovie);
        if (!error) successCount++;
        else console.log(`Failed to insert movie of id ${movie.id}: ${error.message}`);
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