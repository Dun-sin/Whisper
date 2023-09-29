/**
 * @typedef {import('socket.io-client').Socket} Socket
 */

import { NEW_EVENT_DELETE_MESSAGE, NEW_EVENT_EDIT_MESSAGE, NEW_EVENT_SEND_MESSAGE } from '../../../constants.json';

/**
 *
 * @param {Socket} socket
 */
export default function useChatUtils(socket) {
    function sendMessage(message) {
        return new Promise((resolve, reject) => {
            if (!socket.connected) {
                reject(null);
                return;
            }

            socket
                .timeout(30000)
                .emit(NEW_EVENT_SEND_MESSAGE, message, (err, sentMessage) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(sentMessage);
                });
        });
    }

    function deleteMessage({ id, chatId }) {
        return new Promise((resolve, reject) => {
            if (!socket.connected) {
                reject(null);
                return;
            }

            socket
                .timeout(30000)
                .emit(
                    NEW_EVENT_DELETE_MESSAGE,
                    { id, chatId },
                    (err, messageDeleted) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(messageDeleted);
                    }
                );
        });
    }

    function editMessage({ id, chatId, newMessage }) {
        return new Promise((resolve, reject) => {
            if (!socket.connected) {
                reject(null);
                return;
            }

            socket
                .timeout(30000)
                .emit(
                    NEW_EVENT_EDIT_MESSAGE,
                    { id, chatId, newMessage },
                    (err, messageEdited) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(messageEdited);
                    }
                );
        });
    }

    return {
        sendMessage,
        deleteMessage,
        editMessage,
    };
}
