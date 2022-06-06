import { createSlice } from '@reduxjs/toolkit';

const initialState = false;

const options = {
	name: 'isLogged',
	initialState,
	reducers: {
		changeIsLogged: (state, action) => (state = action.payload),
	},
};

export const isLoggedSlice = createSlice(options);

export const { changeIsLogged } = isLoggedSlice.actions;

export default isLoggedSlice.reducer;
