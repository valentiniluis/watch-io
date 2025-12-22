import { pageValidation, limitValidation } from './validationSchemas.js';
import { DELETE_INTERACTION_MESSAGE, LIKE, POST_INTERACTION_MESSAGE, RECOMMENDATION_WEIGHTS } from './constants.js';
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


export function getMovieBasedRecommendationQuery({ movieId, limit, userId }) {
  const { cast, director, crew, keywords, genres, language, rating } = RECOMMENDATION_WEIGHTS;

  const args = [movieId, cast, director, crew, keywords, genres, language, rating, limit];
  if (userId) args.push(userId);
  const recommendationQuery = `
    with cast_score as (
      with casted as (
        select mc.artist_id
        from media_cast as mc
        inner join media as med
        on mc.media_id = med.id
        inner join artist as ar
        on mc.artist_id = ar.id
        where med.id = $1
      ),
      cast_careers as (
        select mc.media_id, ca.artist_id
        from media_cast as mc
        inner join casted as ca
        on mc.artist_id = ca.artist_id
        where mc.media_id != $1
      ),
      scores as (
        select media_id, count(*) as cast_score
        from cast_careers as cc
        group by cc.media_id
      )
      select
        sc.*, (cast(cast_score as float) / (select max(cast_score) from scores)) as normal_cast_score
      from scores as sc
    ),
    director_score as (
      with directors as (
        select artist_id
        from crew as cr
        where job = 'Director'
        and media_id = $1
      ),
      careers as (
        select cr.media_id, cr.artist_id
        from crew as cr
        inner join directors as di
        on cr.artist_id = di.artist_id
        where cr.job = 'Director'
        and cr.media_id != $1
      ),
      scores as (
        select ca.media_id, count(*) as score
        from careers as ca
        group by ca.media_id
      )
      select 
        media_id, score / (select max(score) from scores) as normal_director_score
      from scores
    ),
    crew_score as (
      with crew_members as (
        select cr.artist_id
        from crew as cr
        where cr.media_id = $1
        and cr.job != 'Director'
      ),
      crew_careers as (
        select cr.media_id, cr.artist_id
        from crew_members as cm
        inner join crew as cr
        on cm.artist_id = cr.artist_id
        where cr.media_id != $1
      ),
      scores as (
        select media_id, count(*) as crew_score
        from crew_careers
        group by media_id
      )
      select 
        sc.*, (cast(crew_score as float) / (select max(crew_score) from scores)) as normal_crew_score
      from scores as sc
    ),
    keyword_score as (
      with keywords as (
        select keyword_id
        from media_keyword as mk
        where mk.media_id = $1
      ),
      keyword_movies as (
        select mk.media_id, mk.keyword_id
        from keywords as ke
        inner join media_keyword as mk
        on ke.keyword_id = mk.keyword_id
        where mk.media_id != $1
      ),
      scores as (
        select media_id, count(*) as keyword_score
        from keyword_movies as kem
        group by media_id
      )
      select 
        sc.*, (cast(keyword_score as float) / (select max(keyword_score) from scores)) as normal_keyword_score
      from scores as sc	
    ),
    genre_score as (
      with genres as (
        select genre_id
        from media_genre as mg
        where mg.media_id = $1
      ),
      genre_movies as (
        select mg.media_id, mg.genre_id
        from genres as gs
        inner join media_genre as mg
        on gs.genre_id = mg.genre_id
        where mg.media_id != $1
      ),
      scores as (
        select media_id, count(*) as genre_score
        from genre_movies as gem
        group by media_id
      )
      select 
        sc.*, (cast(genre_score as float) / (select max(genre_score) from scores)) as normal_genre_score
      from scores as sc	
    ),
    language_score as (
      select id as media_id, 1 as normal_language_score
      from movie
      where original_language = (
        select original_language
        from movie as mo
        where mo.id = $1
      )
    ),
    ranks as (
      select 
        mo.id,
        (
          coalesce(cas.normal_cast_score, 0) * $2 +
          coalesce(dis.normal_director_score, 0) * $3 +           
          coalesce(crs.normal_crew_score, 0) * $4 + 
          coalesce(kes.normal_keyword_score, 0) * $5 + 
          coalesce(ges.normal_genre_score, 0) * $6 + 
          coalesce(las.normal_language_score, 0) * $7 +
          tmdb_rating / 10 * $8
        ) as final_score
      from movie as mo
      left join cast_score as cas
      on mo.id = cas.media_id
      left join director_score as dis
      on mo.id = dis.media_id
      left join crew_score as crs
      on mo.id = crs.media_id
      left join keyword_score as kes
      on mo.id = kes.media_id
      left join genre_score as ges
      on mo.id = ges.media_id
      left join language_score as las
      on mo.id = las.media_id
      ${userId ? `
      where mo.id not in (
        select media_id 
        from interaction 
        where user_id = $10
        and type_id = (select id from interaction_type where interaction_type = 'not interested')
      )` : ''}
      order by final_score desc
      limit 50
    )
    select mo.*, round(mo.tmdb_rating, 1) as tmdb_rating
    from ranks as ra
    inner join movie as mo
    on ra.id = mo.id
    order by random()
    limit $9;
  `;

  return [recommendationQuery, args];
}


export function getUserBasedRecommendationQuery({ userId, limit }) {
  const { cast, director, crew, keywords, genres, language, rating } = RECOMMENDATION_WEIGHTS;
 
  const args = [userId, cast, director, crew, keywords, genres, language, rating, limit];
  const query = `
    with favorites as (
      select mr.media_id
      from rating as rt
      where rt.user_id = $1
      and rt.score >= 7
      union
      select media_id
      from interaction as itr
      where itr.user_id = $1
      and itr.type_id = (select id from interaction_type where interaction_type = '${LIKE}')
      and itr.media_id not in (select media_id from rating)
    ),
    cast_score as (
      with casted as (
        select mc.artist_id
        from media_cast as mc
        inner join movie as mv
        on mc.media_id = mv.id
        inner join artist as ar
        on mc.artist_id = ar.id
        where mv.id in (select media_id from favorites)
      ),
      cast_careers as (
        select media_id, ca.artist_id
        from media_cast as mc
        inner join casted as ca
        on mc.artist_id = ca.artist_id
        where mc.media_id not in (select media_id from favorites)
      ),
      scores as (
        select media_id, count(*) as cast_score
        from cast_careers as cc
        group by cc.media_id
      )
      select
        sc.*, (cast(cast_score as float) / (select max(cast_score) from scores)) as normal_cast_score
      from scores as sc
    ),
    director_score as (
      with directors as (
        select artist_id
        from crew as cr
        where job = 'Director'
        and media_id in (select media_id from favorites)
      ),
      careers as (
        select cr.media_id, cr.artist_id
        from crew as cr
        inner join directors as di
        on cr.artist_id = di.artist_id
        where cr.job = 'Director'
        and cr.media_id not in (select media_id from favorites)
      ),
      scores as (
        select ca.media_id, count(*) as score
        from careers as ca
        group by ca.media_id
      )
      select 
        media_id, score / (select max(score) from scores) as normal_director_score
      from scores
    ),
    crew_score as (
      with crew_members as (
        select cr.artist_id
        from crew as cr
        where cr.job != 'Director'
        and cr.media_id in (select media_id from favorites)
      ),
      crew_careers as (
        select cr.media_id, cr.artist_id
        from crew_members as cm
        inner join crew as cr
        on cm.artist_id = cr.artist_id
        where cr.media_id not in (select media_id from favorites)
      ),
      scores as (
        select
          media_id, count(*) as crew_score
        from crew_careers
        group by media_id
      )
      select 
        sc.*, (cast(crew_score as float) / (select max(crew_score) from scores)) as normal_crew_score
      from scores as sc
    ),
    keyword_score as (
      with keywords as (
        select keyword_id
        from media_keyword as mk
        where mk.media_id in (select media_id from favorites)
      ),
      keyword_movies as (
        select mk.media_id, mk.keyword_id
        from keywords as ke
        inner join media_keyword as mk
        on ke.keyword_id = mk.keyword_id
        where mk.media_id not in (select media_id from favorites)
      ),
      scores as (
        select media_id, count(*) as keyword_score
        from keyword_movies as kem
        group by media_id
      )
      select 
        sc.*, (cast(keyword_score as float) / (select max(keyword_score) from scores)) as normal_keyword_score
      from scores as sc	
    ),
    genre_score as (
      with genres as (
        select genre_id
        from media_genre as mg
        where mg.media_id in (select media_id from favorites)
      ),
      genre_movies as (
        select mg.media_id, mg.genre_id
        from genres as gs
        inner join media_genre as mg
        on gs.genre_id = mg.genre_id
        where mg.media_id not in (select media_id from favorites)
      ),
      scores as (
        select media_id, count(*) as genre_score
        from genre_movies as gem
        group by media_id
      )
      select 
        sc.*, (cast(genre_score as float) / (select max(genre_score) from scores)) as normal_genre_score
      from scores as sc	
    ),
    language_score as (
      select id as media_id, 1 as normal_language_score
      from movie
      where original_language in (
        select original_language
        from movie as mo
        where mo.id in (select media_id from favorites)
      )
    ),
    ranks as (
      select 
        mo.id,
        (
          coalesce(cas.normal_cast_score, 0) * $2 + 
          coalesce(dis.normal_director_score, 0) * $3 + 
          coalesce(crs.normal_crew_score, 0) * $4 + 
          coalesce(kes.normal_keyword_score, 0) * $5 + 
          coalesce(ges.normal_genre_score, 0) * $6 + 
          coalesce(las.normal_language_score, 0) * $7 +
          tmdb_rating / 10 * $8
        ) as final_score
      from movie as mo
      left join cast_score as cas
      on mo.id = cas.media_id
      left join director_score as dis
      on mo.id = dis.media_id
      left join crew_score as crs
      on mo.id = crs.media_id
      left join keyword_score as kes
      on mo.id = kes.media_id
      left join genre_score as ges
      on mo.id = ges.media_id
      left join language_score as las
      on mo.id = las.media_id
      where mo.id not in (
        select media_id 
        from interaction as itr 
        where itr.user_id = $1 
        and itr.type_id = (select id from interaction_type where interaction_type = 'not interested')
      )
      order by final_score desc
      limit 60
    )
    select
      mo.*, round(mo.tmdb_rating, 1) as tmdb_rating
    from ranks as ra
    inner join movie as mo
    on ra.id = mo.id
    order by random()
    limit $9;
  `;

  return [query, args];
}