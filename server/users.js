const users = [];
const rooms = [];
let currentRoom;

const user = users[Math.floor(Math.random() * users.length)];

function allUsers(user) {
	users.push(user);
	console.log(users);
}

function matchUsers(socket) {
	createRooms();
	console.log(rooms);
	if (rooms.length < 1) return;

	const pickedRoom = rooms[Math.floor(Math.random() * rooms.length)];
	socket.join(pickedRoom);
	socket.emit('joined');
	console.log(socket.adapter.rooms.get(pickedRoom).size);
}

function createRooms() {
	if (users.length < 2) return;
	let numberOfRoomsToGenerate = Math.floor(users.length / 2);
	for (let i = 0; i < numberOfRoomsToGenerate; i++) {
		rooms.push(Math.random().toString(36).substring(1, 10));
	}
}

module.exports = { allUsers, matchUsers };
