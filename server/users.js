const users = {};
const waiting_users = {};
const active_users = {};
const rooms = [];
let currentRoom;

/*
  @params:  object
  @return: void
*/
function allUsers(user) {
	users.push(user);
}

function addUser(udata) {
	users[udata.id] = udata.room;
}

function getUserRoom(id) {
	return users[id];
}

function addWaitingUser(udata) {
	waiting_users[udata.id] = udata;
}
function getWaitingUser(id) {
	return waiting_users[id];
}

function delWaitingUser(id) {
	delete waiting_users[id];
}

function getWaitingUserLen() {
	return Object.keys(waiting_users).length;
}

function getWaitingUserKeys() {
	return Object.keys(waiting_users);
}

function remWaitingUser(udata) {
	delete waiting_users[udata.id];
}

function addActiveUser(udata) {
	active_users[udata.id] = true;
}

function getUser() {
	let keys = getWaitingUserKeys();
	let index = Math.floor(Math.random() * keys.length);
	let user1 = waiting_users[keys[index]];
	delWaitingUser(user1.id);
	return user1;
}

/*
  @params: void
  @return: void
*/
function createRooms() {
	if (users.length < 2) return;
	let numberOfRoomsToGenerate = Math.floor(users.length / 2);
	console.log('Rooms Generated', numberOfRoomsToGenerate);
	for (let i = 0; i < numberOfRoomsToGenerate; i++) {
		rooms.push(Math.random().toString(36).substring(1, 10));
	}
}

module.exports = {
	allUsers,
	addUser,
	addWaitingUser,
	remWaitingUser,
	addActiveUser,
	getUserRoom,
	getWaitingUserLen,
	getWaitingUserKeys,
	getWaitingUser,
	delWaitingUser,
	getUser,
};
