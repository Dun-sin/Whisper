import { createSlice } from '@reduxjs/toolkit';

const initialState = '';

const options = {
    name: 'ID',
    initialState,
    reducers: {
        addID: (state, action) => (state = action.payload),
    },
};

export const idSlicer = createSlice(options);

export const { addID } = idSlicer.actions;

export default idSlicer.reducer;
