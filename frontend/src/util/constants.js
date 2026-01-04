import AddWatchlistIcon from '/plus.svg';
import RemoveIcon from '/remove.svg';
import LikeIcon from '/like.svg';
import UnlikeIcon from '/unlike.svg';
import BlockIcon from '/block.svg';


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
  { id: 'release_year.asc', name: "Year (↑)", 'data-attribute': 'release_year.asc', 'data-label': "Year ↑" },
  { id: 'release_year.desc', name: "Year (↓)", 'data-attribute': 'release_year.desc', 'data-label': "Year ↓" },
];

export const WATCHLIST = 'WATCHLIST';
export const NOT_INTERESTED = 'NOT_INTERESTED';
export const LIKE = 'LIKE';
export const RATINGS = 'RATINGS';

export const interactionTypes = [WATCHLIST, NOT_INTERESTED, LIKE];

export const EMPTY_MY_AREA_MESSAGE = {
  [WATCHLIST]: 'Your watchlist is empty.',
  [LIKE]: 'You have no liked movies yet.',
  [NOT_INTERESTED]: 'No movies added to the "Not Interested" list yet.',
  [RATINGS]: "You haven't rated any movies yet!"
}

export const LOADING_MY_AREA_MESSAGE = {
  [WATCHLIST]: 'Loading your Watchlist...',
  [NOT_INTERESTED]: 'Loading "Not Interested" list...',
  [LIKE]: "Loading movies you've liked...",
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
const WATCHLIST_BTN_STYLE = 'border-1 border-stone-400 bg-transparent text-stone-200 hover:bg-stone-700';
const LIKE_BTN_STYLE = 'bg-gradient-to-r from-violet-800 to-violet-600 hover:from-violet-700 hover:to-violet-500';
const NOT_INTERESTED_BTN_STYLE = 'bg-red-600 text-white hover:bg-red-700';
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