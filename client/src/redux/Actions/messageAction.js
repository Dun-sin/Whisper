export const add_message = 'add_message';

export const messageAction = (id, message, time, room) => {
	return {
		type: add_message,
		data: {
			id,
			message,
			time,
			room,
		},
	};
};
