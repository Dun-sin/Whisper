import { add_message } from '../Actions/messageAction';

const initalState = [];

const messageReducer = (state = initalState, action) => {
	switch (action.type) {
		case add_message:
			const foundId = state.find((item) => item.id === action.data.id);

			if (foundId === undefined) {
				return [
					...state,
					{
						id: action.data.id,
						message: [].concat(action.data.message),
						time: action.data.time,
						room: action.data.room,
					},
				];
			} else {
				return [
					{
						id: action.data.id,
						message: [...foundId.message].concat(action.data.message),
						time: action.data.time,
						room: action.data.room,
					},
				];
			}
		default:
			return state;
	}
};

export default messageReducer;
