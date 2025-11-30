// src/redux/citySlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	selectedCity: null, // { id, name, region, symbol } or null
};

const citySlice = createSlice({
	name: "city",
	initialState,
	reducers: {
		setCity(state, action) {
			state.selectedCity = action.payload;
		},
		clearCity(state) {
			state.selectedCity = null;
		},
	},
});

export const { setCity, clearCity } = citySlice.actions;
export default citySlice.reducer;
