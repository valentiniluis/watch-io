import { createSlice } from "@reduxjs/toolkit";


const initialState = { isLoggedIn: false, user: null, id: null, email: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, { payload }) {
      state.isLoggedIn = true;
      state.user = payload.name;
      state.id = payload.id;
      state.email = payload.email;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.id = null;
      state.email = null;
    }
  }
});

export const authActions = authSlice.actions;
export default authSlice.reducer;