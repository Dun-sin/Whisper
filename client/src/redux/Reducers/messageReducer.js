import { add_message } from '../Actions/messageAction';

const initalState = {
	messages: {},
};

const messageReducer = (state = initalState, action) => {
	switch (action.type) {
		case add_message:
			return {
				...state,
				messages: action.message,
			};
		default:
			return state;
	}
};

export default messageReducer;
