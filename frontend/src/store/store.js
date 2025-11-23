import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth';
import movieReducer from './movie';
import toastReducer from './toast';


const store = configureStore({
  reducer: {
    auth: authReducer,
    movie: movieReducer,
    toast: toastReducer
  }
});

export default store;