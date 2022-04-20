export const add_message = 'add_message';

export const messageAction = (message) => {
	return {
		type: add_message,
		message: message,
	};
};
