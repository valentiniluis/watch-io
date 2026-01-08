import { createSlice } from "@reduxjs/toolkit";
import { MEDIA_TYPES, MOVIES } from '../util/constants';
import { toastActions } from "./toast";


const MEDIA_MODE = 'MEDIA_MODE';


export function setMediaType(type) {
  return (dispatch) => {
    if (!MEDIA_TYPES.includes(type)) return dispatch(toastActions.setErrorToast(`Invalid media type: ${type}`));

    sessionStorage.setItem(MEDIA_MODE, type);

    dispatch(mediaActions.setMediaType(type));
  }
}



const initialState = {
  type: sessionStorage.getItem(MEDIA_MODE) || MOVIES,
  data: {
    id: null,
    title: null,
    poster_path: null,
    release_year: null,
    tmdb_rating: null
  }
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setMediaType(state, { payload }) {
      state.type = payload;
    },
    setMediaData(state, { payload }) {
      state.data.id = payload.id;
      state.data.title = payload.title;
      state.data.poster_path = payload.poster_path;
      state.data.release_year = payload.release_year;
      state.data.tmdb_rating = payload.tmdb_rating;
    },
    clearMediaData(state) {
      state.data.id = null;
      state.data.title = null;
      state.data.poster_path = null;
      state.data.release_year = null;
      state.data.tmdb_rating = null;
    }
  }
});

export const mediaActions = mediaSlice.actions;
export default mediaSlice.reducer;