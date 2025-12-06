import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: null,
  variant: null
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    // easier to use approach, no typos can occur
    setSuccessToast(state, { payload }) {
      state.message = payload;
      state.variant = "success";
    },
    setErrorToast(state, { payload }) {
      state.message = payload;
      state.variant = "error";
    },
    setInfoToast(state, { payload }) {
      state.message = payload;
      state.variant = "info";
    },
    clearToast(state) {
      state.message = null;
      state.variant = null;
    }
  }
});

export const toastActions = toastSlice.actions;
export default toastSlice.reducer;