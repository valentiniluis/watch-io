export const PG_UNIQUE_ERR = '23505';

// minimum parameters for movies from the API
export const MIN_RATING = 5;

export const MIN_VOTES = 300;

export const RECOMMENDATION_WEIGHTS = {
  cast: 3,
  director: 2,
  crew: 2,
  keywords: 2,
  language: 1,
  genres: 1,
  rating: 3
}

export const JWT_EXPIRY_HOURS = 6;

// constant strings to avoid typos in other files
export const SERIES = 'TV_SERIES';
export const MOVIES = 'MOVIE';
export const MEDIA_TYPES = [MOVIES, SERIES];
export const WATCHLIST = 'WATCHLIST';
export const NOT_INTERESTED = 'NOT_INTERESTED';
export const LIKE = 'LIKE';
const MOVIE_URL_SEGMENT = 'movie';
const SERIES_URL_SEGMENT = 'tv';


export const URL_SEGMENTS = {
  [MOVIES]: MOVIE_URL_SEGMENT,
  [SERIES]: SERIES_URL_SEGMENT
};

export const URL_SEGMENT_TO_CONSTANT_MAPPING = {
  [MOVIE_URL_SEGMENT]: MOVIES,
  [SERIES_URL_SEGMENT]: SERIES
};

export const POST_INTERACTION_MESSAGE = {
  [WATCHLIST]: "Movie added to watchlist successfully!",
  [NOT_INTERESTED]: "Movie added to not interested list. This movie won't be recommended to you anymore.",
  [LIKE]: "Movie added to likes!"
};

export const DELETE_INTERACTION_MESSAGE = {
  [WATCHLIST]: "Removed from Watchlist successfully!",
  [NOT_INTERESTED]: "Removed from 'Not Interested' list!",
  [LIKE]: "Removed from 'Liked' list successfully!"
}