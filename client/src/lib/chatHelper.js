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

export const checkUserResponse = (userLastMessageTime, inactiveTimeThreshold) => {
	const currentTime = new Date().getTime();
	const isInactive = userLastMessageTime && currentTime - userLastMessageTime > inactiveTimeThreshold;
	if (isInactive) {
		createBrowserNotification("don't leave your partner hanging, drop a response");
	}
};
