const { Socket } = require('socket.io');

/**
 * @typedef {{
 *     email: null | string,
 *     loginId: string,
 *     emailOrLoginId: string,
 *     socketConnections: Socket[],
 *     socketIds: string[],
 *     currentChatId: null | string,
 *     chats: {
 *         [key: string]: Chat
 *     }
 * }} ActiveUser
 *
 * @typedef {{
 *     id: string,
 *     userIds: string[],
 *     messages: Message[],
 *     createdAt: string | Date
 * }} Chat
 *
 * @typedef {{
 *     id: string,
 *     message: string,
 *     senderId: string,
 *     time: string | Date,
 *     type: 'room_notification' | 'message'
 * }} Message
 */

const users = {};

/**
 * The list of all users on the waiting list, indexed by emailOrLoginId
 *
 * @type {{[key: string]: ActiveUser}}
 */
const waiting_users = {};

/**
 * The list of all active users (including those on waiting list), indexed
 * by emailOrLoginId
 *
 * @type {{[key: string]: ActiveUser}}
 */
const active_users = {};

const rooms = [];
let currentRoom;

function getRandomPairFromWaitingList() {
    /**
     * Since we indexed waiting users by emailOrLoginId, we need to first
     * retrieve all the keys which would be used for getting random users
     */
    const waitingUserIds = Object.keys(waiting_users);
    const pairedUsers = [];

    for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * waitingUserIds.length);

        const randomId = waitingUserIds[randomIndex];
        pairedUsers.push(waiting_users[randomId]);

        delWaitingUser(randomId);
        waitingUserIds.splice(randomIndex, 1);
    }

    return pairedUsers;
}

/**
 * @param {string} emailOrLoginId
 */
function isUserActive(emailOrLoginId) {
    return Boolean(active_users[emailOrLoginId]);
}

/**
 *
 * @param {{ socketId: string, loginId?: string, email?: null | string}}
 */
function getActiveUser({ socketId, loginId, email }) {
    for (let id in active_users) {
        const user = active_users[id];

        if (
            user.socketIds.includes(socketId) ||
            (email && user.email == email) ||
            (loginId && user.loginId == loginId)
        ) {
            return user;
        }
    }

    return null;
}

/**
 *
 * @param {{
 *     loginId: string,
 *     email?: null | string,
 *     socket: Socket
 * }} param0
 */
function addToWaitingList({ loginId, email, socket }) {
    const emailOrLoginId = email ?? loginId;

    waiting_users[emailOrLoginId] = new Proxy(
        {
            loginId,
            email,
            socketConnections: [socket],
            socketIds: [socket.id],
            chats: {},
            currentChatId: null,
        },
        {
            get(target, prop, receiver) {
                if (prop === 'emailOrLoginId') {
                    return target.email ?? target.loginId;
                }

                return Reflect.get(...arguments);
            },
        }
    );
}

/**
 *
 * @param {ActiveUser} user
 */
function addActiveUser(user) {
    active_users[user.emailOrLoginId] = user;
}

/*
  @params:  object
  @return: void
*/
function allUsers(user) {
    users.push(user);
}

// Here we are adding user
function addUser(udata) {
    users[udata.id] = udata.room;
}

// Here we are getting user
function getUserRoom(id) {
    return users[id];
}

// Here we are adding user's socket with key as soket id
function addWaitingUser(udata) {
    waiting_users[udata.id] = udata;
}
function getWaitingUser(id) {
    return waiting_users[id];
}

// from here we are getting user who are in waiting room.
function getWaitingUser(id) {
    return waiting_users[id];
}

// This funtion is used for removing user from waiting list
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

// This funtion is used for adding user to active list
/* function addActiveUser(udata) {
    active_users[udata.id] = true;
} */

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
    getRandomPairFromWaitingList,
    isUserActive,
    getActiveUser,
    addToWaitingList,
};
