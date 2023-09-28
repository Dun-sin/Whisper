const { NEW_EVENT_STOP_SEARCH, NEW_EVENT_STOP_SEARCH_SUCCESS } = require('../constants');
const { delWaitingUser } = require('../utils/lib');

module.exports = (socket) => {
	try {
		socket.on(NEW_EVENT_STOP_SEARCH, async ({ loginId, email }) => {
			delWaitingUser(email ?? loginId);
			socket.emit(NEW_EVENT_STOP_SEARCH_SUCCESS);
		});
	} catch (err) {
		console.error(err);
	}
};
