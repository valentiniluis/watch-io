import { createSlice } from "@reduxjs/toolkit";
import { MOVIES, SERIES } from '../util/constants';

const initialState = {
  type: MOVIES,
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
    setMediaTypeToTv(state) {
      state.type = SERIES;
    },
    setMediaTypeToMovies(state) {
      state.type = MOVIES;
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