import db from '../model/db.js';
import { PG_UNIQUE_ERR } from './constants.js';


// Dados de 10 mil filmes migrados para o postgreSQL, consultas locais

export async function discoverMovies({ page = 1, user = {} }) {
  const id = user?.id;
  const offset_amount = (page - 1) * 20;
  let query;
  const queryArgs = [offset_amount];

  if (id && id.length) {
    queryArgs.push(id);
    query = `
      WITH not_interested AS (
        SELECT inter.movie_id
        FROM interaction AS inter
        WHERE inter.user_id = $2
        AND inter.type = 'not interested'
      )
      SELECT *
      FROM movie AS mov
      WHERE mov.id NOT IN (
        SELECT movie_id FROM not_interested
      )
      ORDER BY mov.tmdb_rating DESC, mov.title
      LIMIT 20
      OFFSET $1;
    `;
  } else {
    query = `
      SELECT *
      FROM movie AS mov
      ORDER BY mov.tmdb_rating DESC, mov.title
      LIMIT 20
      OFFSET $1;
    `;
  }

  const { rows: data } = await db.query(query, queryArgs);
  return data;
}


export async function searchMovie({ movie, user = {}, page = 1 }) {
  const id = user?.id;
  const offset_amount = (page - 1) * 20;

  let query;
  const queryArgs = [`%${movie}%`, offset_amount];

  if (id && id.length) {
    query = `
      SELECT *
      FROM movie AS mov
      WHERE mov.id NOT IN (
        SELECT inter.movie_id
        FROM interaction AS inter
        WHERE inter.user_id = $3
      )
      AND mov.title ILIKE $1
      ORDER BY mov.tmdb_rating DESC, mov.title
      LIMIT 20
      OFFSET $2;
    `;
    queryArgs.push(id);
  } else {
    query = `
      SELECT *
      FROM movie AS mov
      WHERE mov.title ILIKE $1
      ORDER BY mov.tmdb_rating DESC, mov.title
      LIMIT 20
      OFFSET $2;
    `;
  }

  const { rows: results } = await db.query(query, queryArgs);
  return results;
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