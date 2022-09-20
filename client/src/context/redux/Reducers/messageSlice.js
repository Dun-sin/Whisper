import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const options = {
    name: 'message',
    initialState,
    reducers: {
        addMessages: (state, action) => {
            const message = {
                message: action.payload.messages.message,
                time: action.payload.messages.time,
            };
            const key = action.payload.id;
            if (state[key] === undefined) {
                state[key] = {
                    id: action.payload.id,
                    messages: [].concat(message),
                    room: action.payload.room,
                };
            } else {
                state[key].messages = [...state[key].messages, message];
            }
        },
    },
};

export const messageSlicer = createSlice(options);

export const { addMessages } = messageSlicer.actions;

export default messageSlicer.reducer;
