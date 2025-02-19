import { configureStore } from '@reduxjs/toolkit';
import formsReducer from '../features/forms/formsSlice';

export const store = configureStore({
  reducer: {
    forms: formsReducer,
  },
});
