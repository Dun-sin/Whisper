import {
	NEW_EVENT_DELETE_MESSAGE,
	NEW_EVENT_EDIT_MESSAGE,
	NEW_EVENT_READ_MESSAGE,
	NEW_EVENT_RECEIVE_MESSAGE,
	NEW_EVENT_SEND_FAILED,
} from '../../../constants.json';

import { pemToArrayBuffer } from '../lib/chatHelper';
import { useCallback, useEffect } from 'react';
import { createBrowserNotification } from 'src/lib/browserNotification';
import { useNotification } from 'src/lib/notification';
import { useChat } from 'src/context/ChatContext';
import useCryptoKeys from 'src/hooks/useCryptoKeys';
import { useApp } from 'src/context/AppContext';
import decryptMessage from 'src/lib/decryptMessage';


export default () => {

    const { playNotification } = useNotification();
	const { app } = useApp();

	const {
		addMessage,
		updateMessage,
		removeMessage,
		receiveMessage,
	} = useChat();

	const {
		cryptoKey,
		generateKeyPair,
		importKey,
	} = useCryptoKeys(app.currentChatId);

    const cryptoKeyRef = useRef(null);
	cryptoKeyRef.current = cryptoKey;

    useEffect(() => {

        const onNewMessageHandler = useCallback(async (message) => {
            try {
                const decryptedMessage = await decryptMessage(message.message, cryptoKeyRef.current);
                addMessage(message);
                playNotification('newMessage');
                createBrowserNotification('You received a new message on Whisper', decryptedMessage);
            } catch (error) {
                console.error(`Could not decrypt message: ${error.message}`, error);
            }
        }, [cryptoKey]);
    
        const onDeleteMessageHandler = useCallback(({ id, chatId }) => {
            removeMessage(id, chatId);
        }, []);
    
        const onEditMessageHandler = useCallback((messageEdited) => {
            updateMessage({ ...messageEdited, room: app.currentChatId }, true);
        }, []);
    
        const onLimitMessageHandler = useCallback((data) => {
            alert(data.message);
        }, []);
    
        const onReadMessageHandler = useCallback(({ messageId, chatId }) => {
            receiveMessage(messageId, chatId);
        }, []);
    
      const onPublicStringHandler = useCallback(({ pemPublicKeyString, pemPrivateKeyString }) => {
        const pemPublicKeyArrayBuffer = pemToArrayBuffer(pemPublicKeyString);
        const pemPrivateKeyArrayBuffer = pemToArrayBuffer(pemPrivateKeyString);
    
        // Import PEM-formatted public key as CryptoKey
        importKey(pemPublicKeyArrayBuffer, pemPrivateKeyArrayBuffer);
      }, []);
    

		generateKeyPair();

		socket.on('publicKey', onPublicStringHandler);
		socket.on(NEW_EVENT_RECEIVE_MESSAGE, onNewMessageHandler);
		socket.on(NEW_EVENT_DELETE_MESSAGE, onDeleteMessageHandler);
		socket.on(NEW_EVENT_EDIT_MESSAGE, onEditMessageHandler);
		socket.on(NEW_EVENT_READ_MESSAGE, onReadMessageHandler);
		socket.on(NEW_EVENT_SEND_FAILED, onLimitMessageHandler);

		return () => {
			socket.off(NEW_EVENT_RECEIVE_MESSAGE, onNewMessageHandler);
			socket.off(NEW_EVENT_DELETE_MESSAGE, onDeleteMessageHandler);
			socket.off(NEW_EVENT_EDIT_MESSAGE, onEditMessageHandler);
			socket.off(NEW_EVENT_READ_MESSAGE, onReadMessageHandler);
			socket.off(NEW_EVENT_SEND_FAILED, onLimitMessageHandler);
			socket.off('publicKey', onPublicStringHandler);
		};
	}, []);	
}