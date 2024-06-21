import React, { useEffect, useMemo } from 'react';

import PropTypes from 'prop-types';

import useIsTabActive from 'src/hooks/useIsTabActive';

import useChatUtils from 'src/lib/chatSocket';
import { useApp } from 'src/context/AppContext';
import { useChat } from 'src/context/ChatContext';
import { socket } from 'src/lib/socketConnection';

const MessageSeen = ({ isRead, isSender }) => {
	const { app } = useApp();

	const isTabVisible = useIsTabActive();

	const { messages: state, receiveMessage } = useChat();
	const { seenMessage } = useChatUtils(socket);

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
		// Initialize Intersection Observer
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !isSender) {
						// Mark the message as read
						const messageId = entry.target.getAttribute('id').split('-')[1];
						try {
							seenMessage({
								messageId,
								chatId: app.currentChatId,
							});
						} catch (e) {
							return;
						}
						receiveMessage(messageId, app.currentChatId);
					}
				});
			},
			{ threshold: 0.5 }
			// Trigger when 50% of the element is in the viewport
		);

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
			// Clean up the observer
			observer.disconnect();
		};
	}, [sortedMessages, isTabVisible]);

	return isSender && <p className="text-sm">{isRead ? 'Seen' : 'Not Seen'}</p>;
};

export default MessageSeen;

MessageSeen.propTypes = {
	isRead: PropTypes.bool,
	isSender: PropTypes.bool.isRequired,
};
