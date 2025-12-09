import data from './movie-genres.json' with { type: 'json' };
import { pageValidation, limitValidation } from './validationSchemas.js';
import { recommendationWeights } from './constants.js';


export function getReleaseYear(releaseDate) {
  if (!releaseDate || !releaseDate.length) return 'N/A';
  return releaseDate.split('-')[0];
}


export function getGenreId(searchGenre) {
  const { genres } = data;
  const found = genres.find(genre => genre.name === searchGenre);
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


export function getInteractionMessage(type) {
  let message;
  switch (type) {
    case 'watchlist':
      message = "Movie added to watchlist successfully!";
      break;
    case 'likes':
      message = "Movie added to likes!";
      break;
    case 'uninterested':
      message = "Movie added to not interested list. This movie won't be recommended to you anymore.";
      break;
  }
  return message;
}


export function getMovieBasedRecommendationQuery({ movieId, limit }) {
  const { cast, crew, keywords, genres, language, rating } = recommendationWeights;

  const args = [movieId, cast, crew, keywords, genres, language, rating, limit];
  const recommendationQuery = `
    with cast_score as (
      with casted as (
        select 
          mc.artist_id
        from movie_cast as mc
        inner join movie as mv
        on mc.movie_id = mv.id
        inner join artist as ar
        on mc.artist_id = ar.id
        where mv.id = $1
      ),
      cast_careers as (
        select 
          movie_id, ca.artist_id
        from movie_cast as mc
        inner join casted as ca
        on mc.artist_id = ca.artist_id
        where mc.movie_id != $1
      ),
      scores as (
        select
          movie_id, count(*) as cast_score
        from cast_careers as cc
        group by cc.movie_id
      )
      select
        sc.*, (cast(cast_score as float) / (select max(cast_score) from scores)) as normal_cast_score
      from scores as sc
    ),
    crew_score as (
      with crew_members as (
        select 
          cr.artist_id
        from crew as cr
        where cr.movie_id = $1
      ),
      crew_careers as (
        select 
          cr.*
        from crew_members as cm
        inner join crew as cr
        on cm.artist_id = cr.artist_id
      ),
      scores as (
        select
          movie_id, count(*) as crew_score
        from crew_careers
        group by movie_id
      )
      select 
        sc.*, (cast(crew_score as float) / (select max(crew_score) from scores)) as normal_crew_score
      from scores as sc
    ),
    keyword_score as (
      with keywords as (
        select
          keyword_id
        from movie_keyword as mk
        where mk.movie_id = $1
      ),
      keyword_movies as (
        select
          mk.*
        from keywords as ke
        inner join movie_keyword as mk
        on ke.keyword_id = mk.keyword_id
        where mk.movie_id != $1
      ),
      scores as (
        select 
          movie_id, count(*) as keyword_score
        from keyword_movies as kem
        group by movie_id
      )
      select 
        sc.*, (cast(keyword_score as float) / (select max(keyword_score) from scores)) as normal_keyword_score
      from scores as sc	
    ),
    genre_score as (
      with genres as (
        select
          genre_id
        from movie_genre as mg
        where mg.movie_id = $1
      ),
      genre_movies as (
        select
          mg.*
        from genres as gs
        inner join movie_genre as mg
        on gs.genre_id = mg.genre_id
        where mg.movie_id != $1
      ),
      scores as (
        select 
          movie_id, count(*) as genre_score
        from genre_movies as gem
        group by movie_id
      )
      select 
        sc.*, (cast(genre_score as float) / (select max(genre_score) from scores)) as normal_genre_score
      from scores as sc	
    ),
    language_score as (
      select
        id as movie_id, 1 as normal_language_score
      from movie
      where original_language = (
        select original_language
        from movie as mo
        where mo.id = $1
      )
    ),
    ranks as (
      select 
        mo.id, cas.normal_cast_score, crs.normal_crew_score, kes.normal_keyword_score, ges.normal_genre_score, las.normal_language_score,
        (
          coalesce(cas.normal_cast_score, 0) * $2 + 
          coalesce(crs.normal_crew_score, 0) * $3 + 
          coalesce(kes.normal_keyword_score, 0) * $4 + 
          coalesce(ges.normal_genre_score, 0) * $5 + 
          coalesce(las.normal_language_score, 0) * $6 +
          tmdb_rating / 10 * $7
        ) as final_score
      from movie as mo
      left join cast_score as cas
      on mo.id = cas.movie_id
      left join crew_score as crs
      on mo.id = crs.movie_id
      left join keyword_score as kes
      on mo.id = kes.movie_id
      left join genre_score as ges
      on mo.id = ges.movie_id
      left join language_score as las
      on mo.id = las.movie_id
      order by final_score desc
      limit $8
    )
    select
      mo.*, round(mo.tmdb_rating, 1) as tmdb_rating
    from ranks as ra
    inner join movie as mo
    on ra.id = mo.id
    order by final_score desc;
  `;

  return [recommendationQuery, args];
}


export function getUserBasedRecommendationQuery({ userId, limit }) {
  const { cast, crew, keywords, genres, language, rating } = recommendationWeights;
 
  const args = [userId, cast, crew, keywords, genres, language, rating, limit];
  // arbitrary value used for liked movies score
  const query = `
    with favorites as (
      select mr.movie_id, mr.score
      from movie_rating as mr
      where mr.user_id = $1
      and mr.score >= 7
      union
      select movie_id, 8.5 as score
      from interaction as itr
      where itr.user_id = $1
      and itr.type_id = (select id from interaction_type where interaction_type = 'like')
      and itr.movie_id not in (select movie_id from movie_rating)
    ),
    cast_score as (
      with casted as (
        select 
          mc.artist_id
        from movie_cast as mc
        inner join movie as mv
        on mc.movie_id = mv.id
        inner join artist as ar
        on mc.artist_id = ar.id
        where mv.id in (select movie_id from favorites)
      ),
      cast_careers as (
        select 
          movie_id, ca.artist_id
        from movie_cast as mc
        inner join casted as ca
        on mc.artist_id = ca.artist_id
        where mc.movie_id not in (select movie_id from favorites)
      ),
      scores as (
        select
          movie_id, count(*) as cast_score
        from cast_careers as cc
        group by cc.movie_id
      )
      select
        sc.*, (cast(cast_score as float) / (select max(cast_score) from scores)) as normal_cast_score
      from scores as sc
    ),
    crew_score as (
      with crew_members as (
        select 
          cr.artist_id
        from crew as cr
        where cr.movie_id in (select movie_id from favorites)
      ),
      crew_careers as (
        select 
          cr.*
        from crew_members as cm
        inner join crew as cr
        on cm.artist_id = cr.artist_id
        where cr.movie_id not in (select movie_id from favorites)
      ),
      scores as (
        select
          movie_id, count(*) as crew_score
        from crew_careers
        group by movie_id
      )
      select 
        sc.*, (cast(crew_score as float) / (select max(crew_score) from scores)) as normal_crew_score
      from scores as sc
    ),
    keyword_score as (
      with keywords as (
        select
          keyword_id
        from movie_keyword as mk
        where mk.movie_id in (select movie_id from favorites)
      ),
      keyword_movies as (
        select
          mk.*
        from keywords as ke
        inner join movie_keyword as mk
        on ke.keyword_id = mk.keyword_id
        where mk.movie_id not in (select movie_id from favorites)
      ),
      scores as (
        select 
          movie_id, count(*) as keyword_score
        from keyword_movies as kem
        group by movie_id
      )
      select 
        sc.*, (cast(keyword_score as float) / (select max(keyword_score) from scores)) as normal_keyword_score
      from scores as sc	
    ),
    genre_score as (
      with genres as (
        select
          genre_id
        from movie_genre as mg
        where mg.movie_id in (select movie_id from favorites)
      ),
      genre_movies as (
        select
          mg.*
        from genres as gs
        inner join movie_genre as mg
        on gs.genre_id = mg.genre_id
        where mg.movie_id not in (select movie_id from favorites)
      ),
      scores as (
        select 
          movie_id, count(*) as genre_score
        from genre_movies as gem
        group by movie_id
      )
      select 
        sc.*, (cast(genre_score as float) / (select max(genre_score) from scores)) as normal_genre_score
      from scores as sc	
    ),
    language_score as (
      select
        id as movie_id, 1 as normal_language_score
      from movie
      where original_language in (
        select original_language
        from movie as mo
        where mo.id in (select movie_id from favorites)
      )
    ),
    ranks as (
      select 
        mo.id, cas.normal_cast_score, crs.normal_crew_score, kes.normal_keyword_score, ges.normal_genre_score, las.normal_language_score,
        (
          coalesce(cas.normal_cast_score, 0) * $2 + 
          coalesce(crs.normal_crew_score, 0) * $3 + 
          coalesce(kes.normal_keyword_score, 0) * $4 + 
          coalesce(ges.normal_genre_score, 0) * $5 + 
          coalesce(las.normal_language_score, 0) * $6 +
          tmdb_rating / 10 * $7
        ) as final_score
      from movie as mo
      left join cast_score as cas
      on mo.id = cas.movie_id
      left join crew_score as crs
      on mo.id = crs.movie_id
      left join keyword_score as kes
      on mo.id = kes.movie_id
      left join genre_score as ges
      on mo.id = ges.movie_id
      left join language_score as las
      on mo.id = las.movie_id
      order by final_score desc
      limit 100
    )
    select
      mo.*, round(mo.tmdb_rating, 1) as tmdb_rating
    from ranks as ra
    inner join movie as mo
    on ra.id = mo.id
    order by random()
    limit $8;
  `;

  return [query, args];
}