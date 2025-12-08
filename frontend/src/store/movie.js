import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  id: null,
  title: null,
  poster_path: null,
  release_year: null,
  tmdb_rating: null
};

const movieSlice = createSlice({
  name: 'movie',
  initialState,
  reducers: {
    setMovie(state, { payload }) {
      state.id = payload.id;
      state.title = payload.title;
      state.poster_path = payload.poster_path;
      state.release_year = payload.release_year;
      state.tmdb_rating = payload.tmdb_rating;
    },
    clearMovie(state) {
      state.id = null;
      state.title = null;
      state.poster_path = null;
      state.release_year = null;
      state.tmdb_rating = null;
    }
  }
});

export const movieActions = movieSlice.actions;
export default movieSlice.reducer;