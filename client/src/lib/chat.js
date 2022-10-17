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

    return {
        sendMessage,
    };
}
