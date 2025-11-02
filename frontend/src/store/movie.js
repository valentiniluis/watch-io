import { createSlice } from "@reduxjs/toolkit";


const initialState = { id: null };

const movieSlice = createSlice({
  name: 'movie',
  initialState,
  reducers: {
    setMovie(state, { payload }) {
      state.id = payload.id;
      state.title = payload.title;
      state.poster_path = payload.poster_path;
      state.year = payload.year;
      state.tmdb_rating = payload.tmdb_rating;
    },
    clearMovie(state) {
      state.id = null;
      state.title = null;
      state.poster_path = null;
      state.year = null;
      state.tmdb_rating = null;
    }
  }
});

export const movieActions = movieSlice.actions;
export default movieSlice.reducer;