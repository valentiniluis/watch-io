import db from '../model/db.js';


// Dados de 10 mil filmes migrados para o postgreSQL, consultas locais

export const discoverMovies = async ({ page = 1, user = {} }) => {
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
