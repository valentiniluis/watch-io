export const mainGenres = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
];

export const sortOptions = [
  { id: 'title.asc', name: "Title (↑)", 'data-attribute': 'title.asc', 'data-label': 'Title ↑' },
  { id: 'title.desc', name: 'Title (↓)', 'data-attribute': 'title.desc', 'data-label': 'Title ↓' },
  { id: 'tmdb_rating.asc', name: "Rating (↑)", 'data-attribute': 'tmdb_rating.asc', 'data-label': "Rating ↑" },
  { id: 'tmdb_rating.desc', name: "Rating (↓)", 'data-attribute': 'tmdb_rating.desc', 'data-label': "Rating ↓" },
  { id: 'year.asc', name: "Year (↑)", 'data-attribute': 'year.asc', 'data-label': "Year ↑" },
  { id: 'year.desc', name: "Year (↓)", 'data-attribute': 'year.desc', 'data-label': "Year ↓" },
];

export const myAreaCategories = [
  { id: 'watchlist', name: 'Watchlist', 'data-label': 'Watchlist', 'data-category': 'watchlist' },
  { id: 'like', name: 'Liked', 'data-label': 'Liked', 'data-category': 'like' },
  { id: 'not interested', name: 'Not Interested', 'data-label': 'Not Interested', 'data-category': 'not interested' },
  { id: 'ratings', name: 'Ratings', 'data-label': 'Ratings', 'data-category': 'ratings' },
];

export const interactionTypes = ['watchlist', 'like', 'not interested'];