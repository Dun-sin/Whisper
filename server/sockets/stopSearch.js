const { CHAT_EVENTS } = require('../constants');
const { delWaitingUser } = require('../utils/lib');

module.exports = (socket) => {
	try {
		socket.on(CHAT_EVENTS.NEW_EVENT_STOP_SEARCH, async ({ loginId, email }) => {
			delWaitingUser(email ?? loginId);
			socket.emit(CHAT_EVENTS.NEW_EVENT_STOP_SEARCH_SUCCESS);
		});
	} catch (err) {
		console.error(err);
	}
};
