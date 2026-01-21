import AddWatchlistIcon from '/plus.svg';
import RemoveIcon from '/remove.svg';
import LikeIcon from '/like.svg';
import UnlikeIcon from '/unlike.svg';
import BlockIcon from '/block.svg';

export const HOMEPAGE_GENRES_NUMBER = 7;

export const sortOptions = [
  { id: 'title.asc', name: "Title (↑)", 'data-attribute': 'title.asc', 'data-label': 'Title ↑' },
  { id: 'title.desc', name: 'Title (↓)', 'data-attribute': 'title.desc', 'data-label': 'Title ↓' },
  { id: 'tmdb_rating.asc', name: "Rating (↑)", 'data-attribute': 'tmdb_rating.asc', 'data-label': "Rating ↑" },
  { id: 'tmdb_rating.desc', name: "Rating (↓)", 'data-attribute': 'tmdb_rating.desc', 'data-label': "Rating ↓" },
  { id: 'release_year.asc', name: "Year (↑)", 'data-attribute': 'release_year.asc', 'data-label': "Year ↑" },
  { id: 'release_year.desc', name: "Year (↓)", 'data-attribute': 'release_year.desc', 'data-label': "Year ↓" },
];

export const WATCHLIST = 'WATCHLIST';
export const NOT_INTERESTED = 'NOT_INTERESTED';
export const LIKE = 'LIKE';
export const RATINGS = 'RATINGS';

export const interactionTypes = [WATCHLIST, NOT_INTERESTED, LIKE];

export const EMPTY_MY_AREA_MESSAGE = {
  [WATCHLIST]: (label) => `You have no ${label} in your Watchlist.`,
  [LIKE]: (label) => `You have no liked ${label} yet.`,
  [NOT_INTERESTED]: (label) => `No ${label} have been added to the "Not Interested" list yet.`,
  [RATINGS]: (label) => `You haven't rated any ${label} yet!`
}

export const LOADING_MY_AREA_MESSAGE = {
  [WATCHLIST]: 'Loading your Watchlist...',
  [NOT_INTERESTED]: 'Loading "Not Interested" list...',
  [LIKE]: "Loading your likes...",
  [RATINGS]: "Loading your ratings..."
}

export const myAreaCategories = [
  { id: WATCHLIST, name: 'Watchlist', 'data-label': 'Watchlist', 'data-category': WATCHLIST },
  { id: LIKE, name: 'Liked', 'data-label': 'Liked', 'data-category': LIKE },
  { id: NOT_INTERESTED, name: 'Not Interested', 'data-label': 'Not Interested', 'data-category': NOT_INTERESTED },
  { id: RATINGS, name: 'Ratings', 'data-label': 'Ratings', 'data-category': RATINGS },
];

const ACTIVE = true;
const INACTIVE = false;
const WATCHLIST_BTN_STYLE = 'border-1 border-stone-400 bg-transparent text-stone-200 hover:bg-stone-700 disabled:opacity-50 disabled:border-stone-600 disabled:text-stone-500 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors';
const LIKE_BTN_STYLE = 'bg-gradient-to-r from-violet-800 to-violet-600 hover:from-violet-700 hover:to-violet-500 disabled:from-stone-600 disabled:to-stone-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all';
const NOT_INTERESTED_BTN_STYLE = 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-900/40 disabled:text-stone-500 disabled:hover:bg-red-900/40 disabled:cursor-not-allowed transition-colors';
// object containt button text, icon and tailwindcss style depending whether the interaction type and activity
export const INTERACTION_BTN_CONTENT = {
  [WATCHLIST]: {
    style: WATCHLIST_BTN_STYLE,
    states: {
      [ACTIVE]:   { label: 'Remove From Watchlist', icon: RemoveIcon },
      [INACTIVE]: { label: 'Watchlist',             icon: AddWatchlistIcon }
    }
  },
  [LIKE]: {
    style: LIKE_BTN_STYLE,
    states: {
      [ACTIVE]:   { label: 'Remove from Liked', icon: UnlikeIcon },
      [INACTIVE]: { label: 'Like',              icon: LikeIcon }
    }
  },
  [NOT_INTERESTED]: {
    style: NOT_INTERESTED_BTN_STYLE,
    states: {
      [ACTIVE]:   { label: 'Remove From Not Interested', icon: RemoveIcon },
      [INACTIVE]: { label: 'Not Interested',             icon: BlockIcon }
    }
  }
};

export const SERIES = 'tv';
export const MOVIES = 'movie';
export const MEDIA_TYPES = [MOVIES, SERIES];
export const MEDIA_TYPES_LABELS = {
  [SERIES]: "TV Shows",
  [MOVIES]: "Movies"
};