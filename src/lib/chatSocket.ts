/**
 * @typedef {import('socket.io-client').Socket} Socket
 */
import {
	NEW_EVENT_DELETE_MESSAGE,
	NEW_EVENT_EDIT_MESSAGE,
	NEW_EVENT_SEND_MESSAGE,
	NEW_EVENT_READ_MESSAGE,
} from '@/constants.json';
import { MessageType } from '@/types';
import { Socket } from 'socket.io-client';

export default function useChatUtils(socket: Socket | null) {
	function sendMessage(message: MessageType): Promise<MessageType> {
		return new Promise((resolve, reject) => {
			if (!socket?.connected) {
				reject(null);
				return;
			}

			socket
				.timeout(30000)
				.emit(
					NEW_EVENT_SEND_MESSAGE,
					message,
					(err: any, sentMessage: MessageType) => {
						if (err) {
							reject(err);
							return;
						}

						resolve(sentMessage);
					},
				);
		});
	}

	function deleteMessage({ id, chatId }: { id: string; chatId: string }) {
		return new Promise((resolve, reject) => {
			if (!socket?.connected) {
				reject(null);
				return;
			}

			socket
				.timeout(30000)
				.emit(
					NEW_EVENT_DELETE_MESSAGE,
					{ id, chatId },
					(err: any, messageDeleted: any) => {
						if (err) {
							reject(err);
							return;
						}

						resolve(messageDeleted);
					},
				);
		});
	}

	function editMessage({
		id,
		chatId,
		newMessage,
		oldMessage,
		isEdited,
	}: {
		id: string;
		chatId: string | null;
		newMessage: string;
		oldMessage: string | undefined;
		isEdited?: boolean;
	}): Promise<MessageType> {
		return new Promise((resolve, reject) => {
			if (!socket?.connected) {
				reject(null);
				return;
			}

			socket
				.timeout(30000)
				.emit(
					NEW_EVENT_EDIT_MESSAGE,
					{ id, chatId, newMessage, oldMessage, isEdited },
					(err: any, messageEdited: MessageType) => {
						if (err) {
							reject(err);
							return;
						}

						resolve(messageEdited);
					},
				);
		});
	}

	function seenMessage({
		messageId,
		chatId,
	}: {
		messageId: string;
		chatId: string;
	}) {
		return new Promise((resolve, reject) => {
			if (!socket?.connected) {
				reject(null);
				return;
			}

			socket
				.timeout(30000)
				.emit(
					NEW_EVENT_READ_MESSAGE,
					{ messageId, chatId },
					(err: any, messagedRead: any) => {
						if (err) {
							reject(err);
							return;
						}

						resolve(messagedRead);
					},
				);
		});
	}

	return {
		sendMessage,
		deleteMessage,
		editMessage,
		seenMessage,
	};
}
