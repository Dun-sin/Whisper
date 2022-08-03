const users = [];

const user = users[Math.floor(Math.random() * users.length)];

function allUsers(user) {
	users.push(user);
	console.log(users);
}

function matchUsers(socket, room) {
	users.splice(user, 1);
	socket.join(room);
}

module.exports = { allUsers, matchUsers };
