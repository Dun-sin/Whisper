import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import useIsTabActive from 'src/hooks/useIsTabActive';

import useObserver from 'src/hooks/useObserver';

import { useApp } from 'src/context/AppContext';
import { useChat } from 'src/context/ChatContext';

const MessageSeen = ({ isRead, isSender }) => {
	const { app } = useApp();

	const isTabVisible = useIsTabActive();

	const observer = useObserver(isSender);

	const { messages: state } = useChat();

	const sortedMessages = useMemo(
		() =>
			Object.values(state[app.currentChatId]?.messages ?? {})?.sort((a, b) => {
				const da = new Date(a.time),
					db = new Date(b.time);
				return da - db;
			}),
		[state, app.currentChatId]
	);

	useEffect(() => {
		// Only proceed if the observer and sortedMessages are available
		if (!observer || !sortedMessages.length) {
			return;
		}

		sortedMessages.forEach((message) => {
			if (message.isRead) {
				return;
			}

			const messageElement = document.getElementById(`message-${message.id}`);
			if (messageElement && isTabVisible) {
				observer.observe(messageElement);
			}
		});

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	}, [sortedMessages, isTabVisible, observer]);

	return isSender && <p className="text-sm">{isRead ? 'Seen' : 'Not Seen'}</p>;
};

export default MessageSeen;

MessageSeen.propTypes = {
	isRead: PropTypes.bool,
	isSender: PropTypes.bool.isRequired,
};
