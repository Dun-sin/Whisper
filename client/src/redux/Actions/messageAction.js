export const add_messages = 'add_messages';

export const messageAction = (id, message, time, room) => {
	return {
		type: add_messages,
		data: {
			id,
			message,
			time,
			room,
		},
	};
};
