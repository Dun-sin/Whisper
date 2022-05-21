const add_messages = 'add_messages';

export const messageAction = (id, message, time, room) => {
	return {
		type: add_messages,
		payload: {
			id,
			messages: {
				message,
				time,
			},
			room,
		},
	};
};
