import db from '../model/db.js';


// Dados de 6 mil filmes migrados para o postgres, consulta local
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
        FROM watchio.interaction AS inter
        WHERE inter.user_id = $2
        AND inter.type = 'not interested'
      )
      SELECT *
      FROM watchio.movie AS mov
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
      FROM watchio.movie AS mov
      ORDER BY mov.tmdb_rating DESC, mov.title
      LIMIT 20
      OFFSET $1;
    `;
  }

  const { rows: data } = await db.query(query, queryArgs);
  return data;
}
