import { add_messages } from '../Actions/messageAction';

const initalState = [];

const messageReducer = (state = initalState, action) => {
	switch (action.type) {
		case add_messages:
			const foundId = state.find((item) => item.id === action.data.id);

			if (foundId === undefined) {
				return [
					...state,
					{
						id: action.data.id,
						message: [].concat({
							message: action.data.messages.message,
							time: action.data.messages.time,
						}),
						room: action.data.room,
					},
				];
			} else {
				return [
					{
						id: action.data.id,
						message: [...foundId.message].concat({
							message: action.data.messages.message,
							time: action.data.messages.time,
						}),
						room: action.data.room,
					},
				];
			}
		default:
			return state;
	}
};

export default messageReducer;
