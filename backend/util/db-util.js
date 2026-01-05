import pool from '../model/postgres.js';
import { NOT_INTERESTED, SERIES, RECOMMENDATION_WEIGHTS, MOVIES, LIKE } from './constants.js';
import { calculateOffset } from './util-functions.js';


export async function discoverMedia({ mediaType, page, user = {}, limit }) {
  const id = user?.id;
  const offset = calculateOffset(page, limit);
  const queryArgs = [limit, offset];

  let query = `
    SELECT 
      *,
      med.tmdb_id AS id, 
      ROUND(med.tmdb_rating, 1) AS tmdb_rating, 
      COUNT(*) OVER() AS row_count 
    FROM media AS med
    WHERE med.type_id = (SELECT id FROM media_type WHERE media_name = '${mediaType}')
  `;

  if (id && id.length) {
    queryArgs.push(id);
    query = `
      WITH not_interested AS (
        SELECT itr.media_id
        FROM interaction AS itr
        WHERE itr.user_id = $3
        AND itr.inter_type_id = (SELECT id FROM interaction_type WHERE interaction_type = '${NOT_INTERESTED}')
      )
      ` + query + `
      AND med.id NOT IN (SELECT media_id FROM not_interested)
    `;
  }
  query += " ORDER BY med.tmdb_rating DESC, med.title LIMIT $1 OFFSET $2;";

  const { rows } = await pool.query(query, queryArgs);
  return rows;
}


export async function searchMedia({ title, mediaType, user = {}, limit, page }) {
  const id = user?.id;
  const offset = calculateOffset(page, limit);
  const queryArgs = [mediaType, `%${title}%`, limit, offset];

  let query = `
    SELECT 
      *, 
      med.tmdb_id AS id, 
      ROUND(tmdb_rating, 1) AS tmdb_rating, 
      COUNT(*) OVER() AS row_count
    FROM media AS med
    WHERE med.type_id = (SELECT id FROM media_type WHERE media_name = $1)
    AND (med.title ILIKE $2 OR med.original_title ILIKE $2)
  `;

  if (id && id.length) {
    query += `
      AND med.id NOT IN (
        SELECT itr.media_id
        FROM interaction AS itr
        WHERE itr.user_id = $5
        AND itr.inter_type_id = (SELECT id FROM interaction_type WHERE interaction_type = '${NOT_INTERESTED}')
      )
    `;
    queryArgs.push(id);
  }

  query += `
    ORDER BY med.tmdb_rating DESC, med.title
    LIMIT $3
    OFFSET $4;`
    ;

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

export async function getInteraction({ tmdbId, userId, mediaType }) {
  const { rows: interaction } = await pool.query(`
    SELECT ity.interaction_type 
    FROM interaction AS itr
    INNER JOIN interaction_type AS ity
    ON itr.inter_type_id = ity.id
    WHERE itr.user_id = $1
    AND itr.media_id = (SELECT id FROM media WHERE tmdb_id = $2 AND type_id = (SELECT id FROM media_type WHERE media_name = $3));`,
    [userId, tmdbId, mediaType]
  );
  return interaction;
}


export const getMediaByGenreQuery = (mediaType, orderBy, parameters) => {
  const { genreId, userId, limit } = parameters;
  const queryParams = [genreId, limit];

  let query = `
    SELECT 
      med.tmdb_id AS id,
      med.title,
      med.original_title,
      med.original_language,
      med.release_year,
      med.poster_path,
      med.tmdb_rating,
      ${mediaType === SERIES ? 'med.seasons,' : ''}
      '${mediaType}' AS type,
      ROUND(med.tmdb_rating, 1) AS tmdb_rating,
      COUNT(*) OVER() AS row_count
    FROM media AS med
    INNER JOIN media_genre AS mg
    ON med.id = mg.media_id
    WHERE mg.genre_id = $1
    AND med.type_id = (SELECT id FROM media_type WHERE media_name = '${mediaType}')
  `;
  if (userId) {
    queryParams.push(userId);
    query += `
      AND med.id NOT IN (
        SELECT itr.media_id
        FROM interaction AS itr
        WHERE itr.user_id = $${queryParams.length}
        AND itr.inter_type_id = (SELECT id FROM interaction_type WHERE interaction_type = '${NOT_INTERESTED}')
      )
    `;
  }

  // could be costly if the table were very big. works fine for now
  if (orderBy === 'random') query += ` ORDER BY random() LIMIT $2;`;
  else {
    // unique id used as tiebreaker
    const offset = calculateOffset(parameters.page, parameters.limit);
    queryParams.push(offset);
    const [attr, sort] = orderBy.split('.');
    query += ` ORDER BY med.${attr} ${sort}, med.id ASC LIMIT $2 OFFSET $${queryParams.length};`;
  }
  return [query, queryParams];
};


export const getGenres = async (mediaType) => {
  const genresQuery = `
    SELECT gen.*
    FROM media_type_genre AS mtg
    INNER JOIN genre AS gen
    ON mtg.genre_id = gen.id
    WHERE mtg.media_type_id = (SELECT id FROM media_type WHERE media_name = '${mediaType}')
    AND gen.genre_name != 'Documentary'
    ORDER BY gen.genre_name;`;

  const { rows: genres } = await pool.query(genresQuery);
  return genres;
}


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


export function getMovieBasedRecommendationQuery({ movieId, limit, userId }) {
  const { cast, director, crew, keywords, genres, language, rating } = RECOMMENDATION_WEIGHTS;

  const args = [movieId, limit];
  if (userId) args.push(userId);
  const recommendationQuery = `
    WITH 
    target_media AS (
      SELECT id, original_language FROM media WHERE id = $1
    ),
    norm_cast AS (
      SELECT media_id, (raw_score::float / NULLIF(MAX(raw_score) OVER(), 0)) as score
      FROM (
        SELECT mc.media_id, COUNT(*) as raw_score
        FROM media_cast mc
        WHERE mc.artist_id IN (SELECT artist_id FROM media_cast WHERE media_id = $1) AND mc.media_id != $1
        GROUP BY mc.media_id
      ) AS c
    ),
    norm_director AS (
      SELECT media_id, (raw_score::float / NULLIF(MAX(raw_score) OVER(), 0)) as score
      FROM (
        SELECT cr.media_id, COUNT(*) as raw_score
        FROM crew cr
        WHERE cr.job = 'Director' AND cr.artist_id IN (SELECT artist_id FROM crew WHERE job = 'Director' AND media_id = $1) AND cr.media_id != $1
        GROUP BY cr.media_id
      ) AS d
    ),
    norm_crew AS (
      SELECT media_id, (raw_score::float / NULLIF(MAX(raw_score) OVER(), 0)) as score
      FROM (
        SELECT cr.media_id, COUNT(*) as raw_score
        FROM crew cr
        WHERE cr.job != 'Director' AND cr.artist_id IN (SELECT artist_id FROM crew WHERE media_id = $1 AND job != 'Director') AND cr.media_id != $1
        GROUP BY cr.media_id
      ) AS crw
    ),
    norm_keyword AS (
      SELECT media_id, (raw_score::float / NULLIF(MAX(raw_score) OVER(), 0)) as score
      FROM (
        SELECT mk.media_id, COUNT(*) as raw_score
        FROM media_keyword mk
        WHERE mk.keyword_id IN (SELECT keyword_id FROM media_keyword WHERE media_id = $1) AND mk.media_id != $1
        GROUP BY mk.media_id
      ) AS k
    ),
    norm_genre AS (
      SELECT media_id, (raw_score::float / NULLIF(MAX(raw_score) OVER(), 0)) as score
      FROM (
        SELECT mg.media_id, COUNT(*) as raw_score
        FROM media_genre mg
        WHERE mg.genre_id IN (SELECT genre_id FROM media_genre WHERE media_id = $1) AND mg.media_id != $1
        GROUP BY mg.media_id
      ) AS g
    ),
    ranks AS (
      SELECT 
        med.id,
        med.tmdb_id,
        (
          COALESCE(cas.score, 0) * ${cast} +
          COALESCE(dis.score, 0) * ${director} +           
          COALESCE(crs.score, 0) * ${crew} + 
          COALESCE(kes.score, 0) * ${keywords} + 
          COALESCE(ges.score, 0) * ${genres} + 
          (CASE WHEN med.original_language = (SELECT original_language FROM target_media) THEN 1 ELSE 0 END) * ${language} +
          (COALESCE(med.tmdb_rating, 0) / 10.0) * ${rating}
        ) as final_score
      FROM media med
      LEFT JOIN norm_cast cas ON med.id = cas.media_id
      LEFT JOIN norm_director dis ON med.id = dis.media_id
      LEFT JOIN norm_crew crs ON med.id = crs.media_id
      LEFT JOIN norm_keyword kes ON med.id = kes.media_id
      LEFT JOIN norm_genre ges ON med.id = ges.media_id
      WHERE med.id != $1 
        AND med.type_id = (SELECT id FROM media_type WHERE media_name = '${MOVIES}')
        ${userId ? `
        AND NOT EXISTS (
          SELECT 1 FROM interaction i 
          WHERE i.media_id = med.id 
          AND i.user_id = $3 
          AND i.inter_type_id = (SELECT id FROM interaction_type WHERE interaction_type = '${NOT_INTERESTED}')
        )` : ''}
      ORDER BY final_score DESC
      LIMIT 50
    )
    SELECT
      ra.tmdb_id AS id,
      med.title,
      med.original_title,
      med.poster_path,
      med.release_year,
      med.original_language,
      ROUND(CAST(med.tmdb_rating as numeric), 1) AS tmdb_rating
    FROM ranks AS ra
    JOIN media AS med ON ra.id = med.id
    ORDER BY RANDOM()
    LIMIT $2;
  `;

  return [recommendationQuery, args];
}


export function getUserBasedRecommendationQuery({ userId, limit }) {
  const { cast, director, crew, keywords, genres, language, rating } = RECOMMENDATION_WEIGHTS;

  const args = [userId, limit];
  const query = `
    WITH favorites AS (
      SELECT media_id FROM rating WHERE user_id = $1 AND score >= 7
      UNION
      SELECT media_id FROM interaction 
      WHERE user_id = $1 
      AND inter_type_id = (SELECT id FROM interaction_type WHERE interaction_type = '${LIKE}')
    ),
    stats AS (
      SELECT 
        NULLIF(MAX(c_cast), 0) as max_cast,
        NULLIF(MAX(c_dir), 0) as max_dir,
        NULLIF(MAX(c_crew), 0) as max_crew,
        NULLIF(MAX(c_key), 0) as max_key,
        NULLIF(MAX(c_gen), 0) as max_gen
      FROM (
        SELECT 
          (SELECT COUNT(*) FROM media_cast mc2 WHERE mc2.media_id = m.id) as c_cast,
          (SELECT COUNT(*) FROM crew cr2 WHERE cr2.media_id = m.id AND cr2.job = 'Director') as c_dir,
          (SELECT COUNT(*) FROM crew cr2 WHERE cr2.media_id = m.id AND cr2.job != 'Director') as c_crew,
          (SELECT COUNT(*) FROM media_keyword mk2 WHERE mk2.media_id = m.id) as c_key,
          (SELECT COUNT(*) FROM media_genre mg2 WHERE mg2.media_id = m.id) as c_gen
        FROM media m
        WHERE m.id NOT IN (SELECT media_id FROM favorites)
      ) counts
    ),
    cast_score AS (
      SELECT mc.media_id, CAST(COUNT(*) AS FLOAT) / (SELECT max_cast FROM stats) as normal_cast_score
      FROM media_cast mc
      WHERE mc.artist_id IN (SELECT artist_id FROM media_cast WHERE media_id IN (SELECT media_id FROM favorites))
      AND mc.media_id NOT IN (SELECT media_id FROM favorites)
      GROUP BY mc.media_id
    ),
    director_score AS (
      SELECT cr.media_id, CAST(COUNT(*) AS FLOAT) / (SELECT max_dir FROM stats) as normal_director_score
      FROM crew cr
      WHERE cr.job = 'Director'
      AND cr.artist_id IN (SELECT artist_id FROM crew WHERE job = 'Director' AND media_id IN (SELECT media_id FROM favorites))
      AND cr.media_id NOT IN (SELECT media_id FROM favorites)
      GROUP BY cr.media_id
    ),
    crew_score AS (
      SELECT cr.media_id, CAST(COUNT(*) AS FLOAT) / (SELECT max_crew FROM stats) as normal_crew_score
      FROM crew cr
      WHERE cr.job != 'Director'
      AND cr.artist_id IN (SELECT artist_id FROM crew WHERE job != 'Director' AND media_id IN (SELECT media_id FROM favorites))
      AND cr.media_id NOT IN (SELECT media_id FROM favorites)
      GROUP BY cr.media_id
    ),
    keyword_score AS (
      SELECT mk.media_id, CAST(COUNT(*) AS FLOAT) / (SELECT max_key FROM stats) as normal_keyword_score
      FROM media_keyword mk
      WHERE mk.keyword_id IN (SELECT keyword_id FROM media_keyword WHERE media_id IN (SELECT media_id FROM favorites))
      AND mk.media_id NOT IN (SELECT media_id FROM favorites)
      GROUP BY mk.media_id
    ),
    genre_score AS (
      SELECT mg.media_id, CAST(COUNT(*) AS FLOAT) / (SELECT max_gen FROM stats) as normal_genre_score
      FROM media_genre mg
      WHERE mg.genre_id IN (SELECT genre_id FROM media_genre WHERE media_id IN (SELECT media_id FROM favorites))
      AND mg.media_id NOT IN (SELECT media_id FROM favorites)
      GROUP BY mg.media_id
    ),
    language_score AS (
      SELECT id as media_id, 1.0 as normal_language_score
      FROM media
      WHERE original_language IN (SELECT DISTINCT original_language FROM media WHERE id IN (SELECT media_id FROM favorites))
    ),
    ranks AS (
      SELECT 
        med.id as internal_id,
        med.tmdb_id,
        (
          COALESCE(cas.normal_cast_score, 0) * ${cast} + 
          COALESCE(dis.normal_director_score, 0) * ${director} + 
          COALESCE(crs.normal_crew_score, 0) * ${crew} + 
          COALESCE(kes.normal_keyword_score, 0) * ${keywords} + 
          COALESCE(ges.normal_genre_score, 0) * ${genres} + 
          COALESCE(las.normal_language_score, 0) * ${language} +
          (COALESCE(med.tmdb_rating, 0) / 10.0) * ${rating}
        ) as final_score
      FROM media med
      LEFT JOIN cast_score cas ON med.id = cas.media_id
      LEFT JOIN director_score dis ON med.id = dis.media_id
      LEFT JOIN crew_score crs ON med.id = crs.media_id
      LEFT JOIN keyword_score kes ON med.id = kes.media_id
      LEFT JOIN genre_score ges ON med.id = ges.media_id
      LEFT JOIN language_score las ON med.id = las.media_id
      WHERE med.id NOT IN (SELECT media_id FROM favorites)
      AND med.id NOT IN (
        SELECT media_id FROM interaction 
        WHERE user_id = $1 
        AND inter_type_id = (SELECT id FROM interaction_type WHERE interaction_type = '${NOT_INTERESTED}')
      )
      ORDER BY final_score DESC
      LIMIT 50
    )
    SELECT
      ra.tmdb_id as id,
      med.title,
      med.original_title,
      med.poster_path,
      med.release_year,
      med.original_language,
      round(cast(med.tmdb_rating as numeric), 1) as tmdb_rating
    FROM ranks ra
    JOIN media med ON ra.internal_id = med.id
    ORDER BY RANDOM()
    LIMIT $2;
  `;

  return [query, args];
}