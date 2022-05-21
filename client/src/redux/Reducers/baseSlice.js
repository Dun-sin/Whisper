import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const options = {
	name: 'message',
	initialState,
	reducers: {
		addMessages: (state, action) => {
			const key = action.payload.id;
			state[key] = {
				id: action.payload.id,
				messages: [].concat({
					message: action.payload.messages.message,
					time: action.payload.messages.time,
				}),
				room: action.payload.room,
			};
		},
	},
};

export const messageSlicer = createSlice(options);

export const { addMessages } = messageSlicer.actions;

export default messageSlicer.reducer;
