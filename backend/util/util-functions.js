import { pageValidation, limitValidation } from './validationSchemas.js';
import { DELETE_INTERACTION_MESSAGE, LIKE, MEDIA_TYPES, MOVIES, NOT_INTERESTED, POST_INTERACTION_MESSAGE, RECOMMENDATION_WEIGHTS } from './constants.js';
import pool from '../model/postgres.js';


export function getReleaseYear(releaseDate) {
  if (!releaseDate || !releaseDate.length) return 'N/A';
  return releaseDate.split('-')[0];
}


export async function getGenreId(searchGenre) {
  const { rows: genres } = await pool.query('SELECT * FROM genre;');
  const found = genres.find(genre => genre.genre_name === searchGenre);
  return (found) ? found.id : -1;
}


export function throwError(statusCode, message = "Sorry, something went wrong.") {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}


export function validatePage(page, limit) {
  const { value: pageValue, error: pageErr } = pageValidation.validate(page);
  if (pageErr) throwError(400, 'Invalid page: ' + pageErr.message);

  const { value: limitValue, error: limitErr } = limitValidation.validate(limit);
  if (limitErr) throwError(400, 'Invalid limit: ', limitErr.message);

  return [pageValue, limitValue];
}


export function calculateOffset(page, limit) {
  const offset = (page - 1) * limit;
  return offset;
}


export function postInteractionMessage(type) {
  return POST_INTERACTION_MESSAGE[type];
}


export function deleteInteractionMessage(type) {
  return DELETE_INTERACTION_MESSAGE[type];
}


export function checkValidMediaType(mediaType) {
  return MEDIA_TYPES.includes(mediaType);
}


export function getMovieBasedRecommendationQuery({ movieId, limit, userId }) {
  const { cast, director, crew, keywords, genres, language, rating } = RECOMMENDATION_WEIGHTS;

  const args = [movieId, cast, director, crew, keywords, genres, language, rating, limit];
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
          COALESCE(cas.score, 0) * $2 +
          COALESCE(dis.score, 0) * $3 +           
          COALESCE(crs.score, 0) * $4 + 
          COALESCE(kes.score, 0) * $5 + 
          COALESCE(ges.score, 0) * $6 + 
          (CASE WHEN med.original_language = (SELECT original_language FROM target_media) THEN 1 ELSE 0 END) * $7 +
          (COALESCE(med.tmdb_rating, 0) / 10.0) * $8
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
          AND i.user_id = $10 
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
    LIMIT $9;
  `;

  return [recommendationQuery, args];
}


export function getUserBasedRecommendationQuery({ userId, limit }) {
  const { cast, director, crew, keywords, genres, language, rating } = RECOMMENDATION_WEIGHTS;
 
  const args = [userId, cast, director, crew, keywords, genres, language, rating, limit];
  const query = `
    WITH favorites AS (
      SELECT media_id FROM rating WHERE user_id = $1 AND score >= 7
      UNION
      SELECT media_id FROM interaction 
      WHERE user_id = $1 
      AND inter_type_id = (SELECT id FROM interaction_type WHERE interaction_type = '${LIKE}')
    ),
    -- OTIMIZAÇÃO: Calculamos todos os denominadores (máximos) uma única vez (?)
    stats AS (
      SELECT 
        NULLIF(MAX(c_cast), 0) as max_cast,
        NULLIF(MAX(c_dir), 0) as max_dir,
        NULLIF(MAX(c_key), 0) as max_key,
        NULLIF(MAX(c_gen), 0) as max_gen
      FROM (
        SELECT 
          (SELECT COUNT(*) FROM media_cast mc2 WHERE mc2.media_id = m.id) as c_cast,
          (SELECT COUNT(*) FROM crew cr2 WHERE cr2.media_id = m.id AND cr2.job = 'Director') as c_dir,
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
          COALESCE(cas.normal_cast_score, 0) * $2 + 
          COALESCE(dis.normal_director_score, 0) * $3 + 
          COALESCE(kes.normal_keyword_score, 0) * $5 + 
          COALESCE(ges.normal_genre_score, 0) * $6 + 
          COALESCE(las.normal_language_score, 0) * $7 +
          (COALESCE(med.tmdb_rating, 0) / 10.0) * $8
        ) as final_score
      FROM media med
      LEFT JOIN cast_score cas ON med.id = cas.media_id
      LEFT JOIN director_score dis ON med.id = dis.media_id
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
    LIMIT $9;
  `;

  return [query, args];
}