import { cloneState } from './utils';

export default function chatReducer(state, action) {
	const clonedState = cloneState(state);

	switch (action.type) {
		case 'ADD_MESSAGE_OLD': {
			const { id, time, room, messageId, status } = action.payload;

			const message = {
				message: action.payload.message,
				time,
				senderId: id,
				id: messageId,
				status,
			};

			if (clonedState[id] === undefined) {
				clonedState[id] = {
					id,
					messages: [].concat(message),
					room,
				};
			} else {
				clonedState[id].messages.push(message);
			}
			break;
		}

		case 'CREATE_CHAT': {
			const { chatId, userIds, messages = {}, createdAt = new Date() } = action.payload;

			clonedState[chatId] = {
				userIds,
				messages,
				createdAt,
			};
			break;
		}

		case 'CLOSE_CHAT': {
			const { chatId } = action.payload;

			delete clonedState[chatId];
			break;
		}

		case 'CLOSE_ALL_CHATS': {
			for (const chatId in clonedState) {
				delete clonedState[chatId];
			}
			break;
		}

		case 'ADD_MESSAGE': {
			const { senderId, room, id, message, time, status, containsBadword } = action.payload;

			if (!clonedState[room]) {
				throw new Error('Room not found!');
			}

			clonedState[room].messages[id] = {
				senderId,
				room,
				id,
				message,
				time,
				status,
				containsBadword,
			};
			break;
		}

		case 'UPDATE_MESSAGE': {
			const { message, isEdited } = action.payload;

			const id = message.id;
			if (!clonedState[message.room]) {
				throw new Error('Room not found!');
			}

			if (id !== message.id) {
				delete clonedState[message.room].messages[id];
			}

			const room = message.room;
			const messageId = message.id;
			const updatedMessage = message;
			const oldMessages = message.oldMessages;

			// Assign the message to the cloned state
			clonedState[room].messages[messageId] = updatedMessage;

			// Update the 'isEdited' property
			if (isEdited === undefined || isEdited === null) {
				break;
			}
			clonedState[room].messages[messageId].isEdited = isEdited;

			if (oldMessages.length === 0) {
				break;
			}

			clonedState[room].messages[messageId].oldMessages = oldMessages 
			break;
		}

		case 'REMOVE_MESSAGE': {
			const { id, room } = action.payload;

			if (!clonedState[room]) {
				break;
			}

			delete clonedState[room].messages[id];
			break;
		}

		case 'RECEIVE_MESSAGE': {
			const { id, room } = action.payload;

			if (!clonedState[room]) {
				break;
			}

			if (clonedState[room].messages[id].isRead) {
				break;
			}
			clonedState[room].messages[id].isRead = true;
			break;
		}

		case 'EDIT_TEXT': {
			const { id, room, newText, oldMessage } = action.payload;
			if (!clonedState[room]) {
				break;
			}

			clonedState[room].messages[id].message = newText;
			clonedState[room].messages[id].isEdited = true;
			if (!Array.isArray(clonedState[room].messages[id].oldMessages)) {
				clonedState[room].messages[id].oldMessages = [];
			}
			clonedState[room].messages[id].oldMessages.push(oldMessage);
			break;
		}
		default:
			throw new Error('No action provided!');
	}

	// Save auth state to localStorage on each change
	localStorage.setItem('chats', JSON.stringify(clonedState));

	return clonedState;
}
