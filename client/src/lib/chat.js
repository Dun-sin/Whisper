/**
 * @typedef {import('socket.io-client').Socket} Socket
 */

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
                .emit('send_message', message, (err, sentMessage) => {
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
                    'delete_message',
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
                    'edit_message',
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
