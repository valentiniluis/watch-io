import { createSlice } from "@reduxjs/toolkit";


const initialState = { isLoggedIn: false, user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, { payload }) {
      state.isLoggedIn = true;
      state.user = payload.given_name;
    },
    logout(state) {
      state.isLoggedIn = false;
    }
  }
});

export const authActions = authSlice.actions;
export default authSlice.reducer;