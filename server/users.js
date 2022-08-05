const users = [];
const rooms = [];
let currentRoom;

const user = users[Math.floor(Math.random() * users.length)];


/*
  @params:  object
  @return: void
*/
function allUsers(user) {
	users.push(user);
	console.log(users);
}


/*
  @params: object
  @return: void
*/
function matchUsers(socket) {
	createRooms();
	users.splice(user, 1);
	const pickedRoom = rooms[Math.floor(Math.random() * rooms.length)];
	socket.join(pickedRoom);
	socket.adapter.rooms.get(pickedRoom).size;
	socket.emit('joined');
}

/*
  @params: void
  @return: void
*/
function createRooms() {
	if (users.length < 2) return;
	let numberOfRoomsToGenerate = Maths.floor(users.length / 2);
	for (let i = 0; i < numberOfRoomsToGenerate; i++) {
		rooms.push(Math.random().toString(36).substring(1, 12));
	}
	console.log(rooms);
}

module.exports = { allUsers, matchUsers };
