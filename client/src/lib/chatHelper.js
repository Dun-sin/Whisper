import { createBrowserNotification } from 'src/lib/browserNotification';

export default (state, app) => {
	const getMessage = (id) => {
		if (!state[app.currentChatId]) {
			return null;
		}

		return state[app.currentChatId].messages[id];
	};

	const messageExists = (id) => {
		return Boolean(getMessage(id));
	};

	const handleResend = (id, doSend) => {
		if (!messageExists(id)) {
			return;
		}

		const { senderId, room, message, time } = getMessage(id, state, app);

		doSend({
			senderId,
			room,
			message,
			time,
			tmpId: id,
		});
	};

	const handleCopyToClipBoard = async (id) => {
		const { message } = getMessage(id, state, app);
		if (message.includes('Warning Message')) {
			return;
		}
		if ('clipboard' in navigator) {
			return await navigator.clipboard.writeText(message);
		} else {
			return document.execCommand('copy', true, message);
		}
	};

	return { getMessage, messageExists, handleCopyToClipBoard, handleResend };
};

export const adjustTextareaHeight = (inputRef) => {
	if (inputRef.current) {
		const minTextareaHeight = '45px';
		const currentScrollHeight = inputRef.current.scrollHeight + 'px';

		inputRef.current.style.height =
			Math.max(parseInt(minTextareaHeight), parseInt(currentScrollHeight)) + 'px';
	}
};

export const getTime = (time) => {
	return new Date(time).toLocaleTimeString();
};

export const checkPartnerResponse = (lastMessageTime, inactiveTimeThreshold) => {
	const currentTime = new Date().getTime();
	const isInactive = lastMessageTime && currentTime - lastMessageTime > inactiveTimeThreshold;
	if (isInactive) {
		createBrowserNotification("your partner isn't responding, want to leave?");
	}
};

// As we cant store data in array form directly in database we need to convert it into string which is Base64 of Unit8Array
export const arrayBufferToBase64 = (arrayBuffer) => {
	let binary = '';
	const bytes = new Uint8Array(arrayBuffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
	  binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
};

// This function is used keys which are in ArrayBuffer form to PEM because we cant sent the keys through socket.io in ArrayBuffer form
export const convertArrayBufferToPem = (arrayBuffer, type) => {
	const buffer = new Uint8Array(arrayBuffer);
	const base64String = btoa(String.fromCharCode.apply(null, buffer));
	return `-----BEGIN ${type}-----\n${base64String}\n-----END ${type}-----`;
};

// This function does opposite of above function. After receiving keys from socket.io in PEM string we need to apply below function.
export const pemToArrayBuffer = (pemString) => {
	const base64String = pemString && pemString
	  .replace(/-----BEGIN (.+)-----/, '')
	  .replace(/-----END (.+)-----/, '')
	  .replace(/\s/g, '');
  
	const binaryString = atob(base64String);
	const byteArray = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
	  byteArray[i] = binaryString.charCodeAt(i);
	}
  
	return byteArray.buffer;
  }
