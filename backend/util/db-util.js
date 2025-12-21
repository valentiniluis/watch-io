import pool from '../model/postgres.js';
import { NOT_INTERESTED } from './constants.js';
import { calculateOffset } from './util-functions.js';


export async function discoverMedia({ mediaType, page, user = {}, limit }) {
  const id = user?.id;
  const offset = calculateOffset(page, limit);
  const queryArgs = [mediaType, limit, offset];

  let query = `
    SELECT *, ROUND(med.tmdb_rating, 1) AS tmdb_rating, COUNT(*) OVER() AS row_count 
    FROM media AS med
    WHERE med.type_id = (SELECT id FROM media_type WHERE media_name = $1)
  `;

  if (id && id.length) {
    queryArgs.push(id);
    query = `
      WITH not_interested AS (
        SELECT inter.media_id
        FROM interaction AS inter
        WHERE inter.user_id = $3
        AND inter.type_id = (SELECT id FROM interaction_type WHERE interaction_type = ${NOT_INTERESTED})
      )
      ` + query + `
      WHERE med.id NOT IN (SELECT media_id FROM not_interested)
    `;
  }
  query += " ORDER BY med.tmdb_rating DESC, med.title LIMIT $1 OFFSET $2;";

  const { rows } = await pool.query(query, queryArgs);
  return rows;
}


export async function searchMedia({ title, mediaType, user = {}, limit, page }) {
  const id = user?.id;
  const offset = calculateOffset(page, limit);
  const queryArgs = [`%${title}%`, mediaType, limit, offset];

  let query = `
    SELECT *, ROUND(tmdb_rating, 1) AS tmdb_rating, COUNT(*) OVER() AS row_count
    FROM media AS med
    WHERE med.type_id = (SELECT id FROM media_type WHERE media_name = $1)
    AND (med.title ILIKE $2 OR med.original_title ILIKE $2)
  `;

  if (id && id.length) {
    query += `
      AND med.id NOT IN (
        SELECT inter.media_id
        FROM interaction AS inter
        WHERE inter.user_id = $5
        AND inter.type_id = (SELECT id FROM interaction_type WHERE interaction_type = ${NOT_INTERESTED})
      )
    `;
    queryArgs.push(id);
  }

  query += `
    ORDER BY med.tmdb_rating DESC, med.title
    LIMIT $3
    OFFSET $4;`;

  const { rows } = await pool.query(query, queryArgs);
  return rows;
}


export function getPagesAndClearData(data, limit, key = 'data') {
  const total_items = data.length > 0 ? +data[0].row_count : 0;
  const pages = Math.ceil(total_items / limit);
  // cleanup
  data.forEach(item => delete item.row_count);
  return { [key]: data, pages };
}


export async function getInteraction({ movieId, userId }) {
  const { rows: interaction } = await pool.query(`
    SELECT ity.interaction_type 
    FROM interaction AS inter
    INNER JOIN interaction_type AS ity
    ON inter.type_id = ity.id
    WHERE inter.user_id = $1
    AND inter.media_id = $2;`,
    [userId, movieId]
  );
  return interaction;
}


export const getMovieGenreQuery = (orderBy, authenticated, parameters) => {
  const queryParams = [parameters.genreId];
  let query = `
    SELECT med.*, ROUND(med.tmdb_rating, 1) AS tmdb_rating, COUNT(*) OVER() AS row_count
    FROM media AS med
    INNER JOIN media_genre AS mg
    ON med.id = mg.media_id
    WHERE mg.genre_id = $1
  `;
  if (authenticated) {
    queryParams.push(parameters.userId);
    query += `
      AND med.id NOT IN (
        SELECT inter.media_id
        FROM interaction AS inter
        WHERE inter.user_id = $${queryParams.length}
        AND inter.type_id = (SELECT id FROM interaction_type WHERE interaction_type = ${NOT_INTERESTED})
      )
    `;
  }

  queryParams.push(parameters.limit);

  // could be costly if the table were very big. works fine for now
  if (orderBy === 'random') query += ` ORDER BY random() LIMIT $${queryParams.length};`;
  else {
    // unique id used as tiebreaker
    const offset = calculateOffset(parameters.page, parameters.limit);
    queryParams.push(offset);
    const [attr, sort] = orderBy.split('.');
    query += ` ORDER BY med.${attr} ${sort}, med.id ASC LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length};`;
  }
  return [query, queryParams];
};


const constructValues = (valuesQty, dataArray) => {
  const values = dataArray.map((_, index) => {
    const valuesArray = [];

    // add '$1', '$2', '$3', ..., '$n' to array
    for (let i = 1; i <= valuesQty; i++) valuesArray.push(`$${index * valuesQty + i}`);

    // join '$n' values and separate by comma
    return '(' + valuesArray.join(', ') + ')';
  });
  return values.join(', ');
}


export const insertMovie = async (movie) => {
  let error = null;
  const client = await pool.connect();

  try {
    let values, args;

    const {
      id: movieId, title, original_title, original_language,
      poster_path, release_year, tmdb_rating, genres,
      keywords, cast, crew
    } = movie;

    // inserting a movie must be an atomic transaction
    await client.query("BEGIN");

    await client.query(`
      INSERT INTO
      movie (id, title, original_title, original_language, poster_path, release_year, tmdb_rating)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7);`,
      [movieId, title, original_title, original_language, poster_path, release_year, tmdb_rating.toFixed(2)]
    );

    values = genres.map((_, index) => `($1, $${index + 2})`).join(', ');
    const genre_ids = genres.map(genre => genre.id);
    args = [movieId].concat(genre_ids);
    await client.query(`
      INSERT INTO
      media_genre (media_id, genre_id)
      VALUES
      ${values};`,
      args
    );

    const idKeyword = [];
    values = constructValues(2, keywords);
    args = keywords.forEach(({ id, keyword }) => idKeyword.push(id, keyword));
    await client.query(`
      INSERT INTO
      keyword (id, keyword)
      VALUES
      ${values}
      ON CONFLICT (id) DO NOTHING;`,
      args
    );

    values = keywords.map((_, index) => `($1, $${index + 2})`).join(', ');
    const keyword_ids = keywords.map(keyword => keyword.id);
    args = [movieId].concat(keyword_ids);
    await client.query(`
      INSERT INTO
      media_keyword (media_id, keyword_id)
      VALUES
      ${values};`,
      args
    );

    const artistData = [];
    const artists = [...cast, ...crew];
    values = constructValues(5, artists);
    args = artists.forEach(({ id, name, original_name, known_for_department, popularity }) =>
      artistData.push(id, name, original_name, known_for_department, popularity)
    );
    await client.query(`
      INSERT INTO 
      artist (id, artist_name, original_name, known_for, popularity) 
      VALUES 
      ${values} 
      ON CONFLICT (id) DO NOTHING;`,
      args
    );

    const castArgs = [];
    values = cast.forEach((_, index) => `($1, $${index * 3 + 2}, $${index * 3 + 3}, $${index * 3 + 4})`).join(", ");
    cast.forEach(({ id, character, credit_id }) => castArgs.push(id, credit_id, character));
    args = [movieId].concat(castArgs);
    await client.query(`
      INSERT INTO 
      media_cast (media_id, artist_id, credit_id, character_name) 
      VALUES 
      ${values};`,
      args
    );

    const crewArgs = [];
    values = crew.forEach((_, index) => `($1, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4}, $${index * 4 + 5})`).join(", ");
    crew.forEach(({ id, credit_id, department, job }) => castArgs.push(id, credit_id, department, job));
    args = [movieId].concat(crewArgs);
    await client.query(`
      INSERT INTO 
      crew (media_id, artist_id, credit_id, department, job) 
      VALUES 
      ${values};`,
      args
    );

    await client.query("COMMIT");
  } catch (err) {
    error = err;
    client.query("ROLLBACK");
  } finally {
    client.release();
    return error;
  }
}
