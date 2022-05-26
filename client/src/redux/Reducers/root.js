import messageReducer from './messageSlice';

const root = {
	reducer: {
		messages: messageReducer,
	},
};

export default root;
