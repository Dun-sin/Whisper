import messageReducer from './messageSlice';
import IDReducer from './idSlice';
import isLoggedReducer from './isLogged';

const root = {
	reducer: {
		ID: IDReducer,
		messages: messageReducer,
		isLogged: isLoggedReducer,
	},
};

export default root;
