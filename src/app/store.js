import { configureStore } from "@reduxjs/toolkit";
import loaderReducer from "../Slices/loaderSlice.js";

const store = configureStore({
  reducer: {
    loader: loaderReducer,
  },
});

export default store; 
