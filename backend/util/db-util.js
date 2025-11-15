import db from '../model/db.js';
import { PG_UNIQUE_ERR } from './constants.js';


// Dados de 10 mil filmes migrados para o postgreSQL, consultas locais

export async function discoverMovies({ page, user = {}, limit }) {
  const id = user?.id;
  const offset_amount = (page - 1) * limit;
  let query;
  const queryArgs = [limit, offset_amount];

  if (id && id.length) {
    queryArgs.push(id);
    query = `
      WITH not_interested AS (
        SELECT inter.movie_id
        FROM interaction AS inter
        WHERE inter.user_id = $3
        AND inter.type = 'not interested'
      )
      SELECT *, COUNT(*) OVER() AS row_count 
      FROM movie AS mov
      WHERE mov.id NOT IN (
        SELECT movie_id FROM not_interested
      )
      ORDER BY mov.tmdb_rating DESC, mov.title
      LIMIT $1
      OFFSET $2;
    `;
  } else {
    query = `
      SELECT *, COUNT(*) OVER() AS row_count 
      FROM movie AS mov
      ORDER BY mov.tmdb_rating DESC, mov.title
      LIMIT $1
      OFFSET $2;
    `;
  }

  const { rows } = await db.query(query, queryArgs);
  return rows;
}


export async function searchMovie({ movie, user = {}, limit, page }) {
  const id = user?.id;
  const offset_amount = (page - 1) * limit;

  let query;
  const queryArgs = [`%${movie}%`, limit, offset_amount];

  if (id && id.length) {
    query = `
      SELECT *, COUNT(*) OVER() AS row_count
      FROM movie AS mov
      WHERE mov.id NOT IN (
        SELECT inter.movie_id
        FROM interaction AS inter
        WHERE inter.user_id = $4
      )
      AND mov.title ILIKE $1
      ORDER BY mov.tmdb_rating DESC, mov.title
      LIMIT $2
      OFFSET $3;
    `;
    queryArgs.push(id);
  } else {
    query = `
      SELECT *, COUNT(*) OVER() AS row_count
      FROM movie AS mov
      WHERE mov.title ILIKE $1
      ORDER BY mov.tmdb_rating DESC, mov.title
      LIMIT $2
      OFFSET $3;
    `;
  }

  const { rows } = await db.query(query, queryArgs);
  return rows;
}


export function getPagesAndClearData(data, limit, key='data') {
  const total_items = data.length > 0 ? +data[0].row_count : 0;
  const pages = Math.ceil(total_items / limit);
  // cleanup
  data.forEach(item => delete item.row_count);
  return { [key]: data, pages };
}


export async function getInteraction({ movieId, userId }) {
  const { rows: interaction } = await db.query(`
    SELECT inter.type 
    FROM interaction AS inter
    WHERE inter.user_id = $1
    AND inter.movie_id = $2;`,
    [userId, movieId]
  );
  return interaction;
}


// if it's duplicate record, ignore the error.
// else throw it and stop execution
export async function tryInsert(stmt, args) {
  let err = null;

  try {
    await db.query(stmt, args);
  } catch (error) {
    err = error;
  }

  if (err && err.code !== PG_UNIQUE_ERR) throw err;
}


export const getMovieGenreQuery = (orderBy, authenticated, parameters) => {
  const queryParams = [parameters.genreId];
  let query = `
    SELECT mov.*, COUNT(*) OVER() AS row_count
    FROM movie AS mov
    INNER JOIN movie_genre AS mg
    ON mov.id = mg.movie_id
    WHERE mg.genre_id = $1
  `;
  if (authenticated) {
    queryParams.push(parameters.userId);
    query += `
      AND mov.id NOT IN (
        SELECT inter.movie_id
        FROM interaction AS inter
        WHERE inter.user_id = $${queryParams.length}
        AND inter.type = 'not interested'
      )
    `;
  }

  queryParams.push(parameters.limit);

  // could be costly if the table were very big. works fine for now
  if (orderBy === 'random') query += ` ORDER BY random() LIMIT $${queryParams.length};`;
  else {
    // unique id used as tiebreaker
    const offset = (parameters.page - 1) * parameters.limit;
    queryParams.push(offset);
    const [attr, sort] = orderBy.split('.');
    query += ` ORDER BY ${attr} ${sort}, mov.id ASC LIMIT $${queryParams.length-1} OFFSET $${queryParams.length};`;
  }
  return [query, queryParams];
};