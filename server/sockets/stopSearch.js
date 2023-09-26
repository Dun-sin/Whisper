const { delWaitingUser } = require('../utils/lib');

module.exports = (socket) => {
	try {
		socket.on('stop_search', async ({ loginId, email }) => {
			delWaitingUser(email ?? loginId);
			socket.emit('stop_search_success');
		});
	} catch (err) {
		console.error(err);
	}
};
