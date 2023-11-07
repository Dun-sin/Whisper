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

	function scrollToMessage(messageId, animate = true) {
		const element = document.getElementById(`message-${messageId}`);

		if (!element) {
			return;
		}

		const alreadyHighlighted = element.classList.contains('bg-[#FF9F1C]/25');

		element.scrollIntoView({
			behavior: 'auto',
		});

		if (!animate) {
			return;
		}

		if (alreadyHighlighted) {
			element.classList.replace('bg-[#FF9F1C]/25', 'bg-[#FF9F1C]/50');
		} else {
			element.classList.add('bg-[#FF9F1C]/50');
		}

		element.addEventListener(
			'transitionend',
			() => {
				if (alreadyHighlighted) {
					element.classList.replace('bg-[#FF9F1C]/50', 'bg-[#FF9F1C]/25');
				} else {
					element.classList.remove('bg-[#FF9F1C]/50');
				}
			},
			{
				once: true,
			}
		);
	}

	return { getMessage, messageExists, handleCopyToClipBoard, handleResend, scrollToMessage };
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

export const isGreaterThan3Minutes = (interval, time) => {
	const currentTime = Date.now();
	const timeDifference = currentTime - time;

	if (timeDifference > interval) {
		return true;
	}
	return false;
};
