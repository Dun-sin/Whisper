import { applyMiddleware } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import root from './Reducers/root';

const composedEnchancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

const store = configureStore(root, composedEnchancer);

export default store;
