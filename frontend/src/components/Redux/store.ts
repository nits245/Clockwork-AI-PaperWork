import { configureStore } from "@reduxjs/toolkit";
import DataSlice from "./DataSlice";

// Configure the Redux store with the DataSlice reducer
const store = configureStore({
  reducer: {
    data: DataSlice,
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;