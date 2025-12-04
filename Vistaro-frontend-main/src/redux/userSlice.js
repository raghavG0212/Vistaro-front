import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	isAuthenticated: false,
	token: null,
	email: null,
	role: null,
	city: null,
	userId: null,
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action) => {
			const { token, email, role, city, userId } = action.payload;

			state.isAuthenticated = true;
			state.token = token;
			state.email = email;
			state.role = role;
			state.city = city;
			state.userId = userId;

			// Persist to localStorage
			localStorage.setItem(
				"vistaroAuth",
				JSON.stringify({ token, email, role, city, userId })
			);
		},

		loadUserFromStorage: (state) => {
			const saved = localStorage.getItem("vistaroAuth");
			if (!saved) return;

			const parsed = JSON.parse(saved);

			state.isAuthenticated = true;
			state.token = parsed.token;
			state.email = parsed.email;
			state.role = parsed.role;
			state.city = parsed.city;
			state.userId = parsed.userId;
		},

		logoutUser: (state) => {
			// Clear redux
			Object.assign(state, initialState);

			// Clear localStorage
			localStorage.removeItem("vistaroAuth");
			localStorage.removeItem("token");
		},
	},
});

export const { setUser, loadUserFromStorage, logoutUser } = userSlice.actions;
export default userSlice.reducer;
