import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth';
import mediaReducer from './media';
import toastReducer from './toast';

const store = configureStore({
  reducer: {
    auth: authReducer,
    media: mediaReducer,
    toast: toastReducer
  }
});

export default store;