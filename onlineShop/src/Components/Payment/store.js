import { configureStore } from "@reduxjs/toolkit";
import mpesaReducer from "./stateSlice";

const store = configureStore({
  reducer: {
    mpesa: mpesaReducer,
  },
});

export default store;
