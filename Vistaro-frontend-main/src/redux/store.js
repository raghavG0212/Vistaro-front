// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import storage from "redux-persist/lib/storage";

// reducers
import cityReducer from "./citySlice";
import userReducer from "./userSlice";     // ✅ ADD THIS

// --------------------------------------------------
// COMBINED REDUCERS
// --------------------------------------------------
const rootReducer = combineReducers({
  city: cityReducer,
  user: userReducer,        // ✅ add user slice here
});

// --------------------------------------------------
// PERSIST CONFIG
// --------------------------------------------------
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["city", "user"], // store city + user in localStorage
};

// --------------------------------------------------
// PERSISTED REDUCER
// --------------------------------------------------
const persistedReducer = persistReducer(persistConfig, rootReducer);

// --------------------------------------------------
// STORE
// --------------------------------------------------
export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }),
});

// --------------------------------------------------
export const persistor = persistStore(store);
export default store;
