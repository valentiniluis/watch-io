import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: null,
  variant: null
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    setToast(state, { payload }) {
      state.message = payload.message;
      state.variant = payload.variant;
    },
    clearToast(state) {
      state.message = null;
      state.variant = null;
    }
  }
});

export const toastActions = toastSlice.actions;
export default toastSlice.reducer;