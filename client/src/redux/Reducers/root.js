import messageReducer from './messageSlice';
import IDReducer from './idSlice';

const root = {
	reducer: {
		ID: IDReducer,
		messages: messageReducer,
	},
};

export default root;
