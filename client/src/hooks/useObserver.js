import useChatUtils from 'src/lib/chatSocket';
import { socket } from 'src/lib/socketConnection';
import { useChat } from 'src/context/ChatContext';
import { useApp } from 'src/context/AppContext';
import { useCallback } from 'react';

export default (isSender) => {
	const { seenMessage } = useChatUtils(socket);
	const { receiveMessage } = useChat();
	const { app } = useApp();

	const observerCallback = useCallback(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !isSender) {
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
		[isSender, seenMessage, receiveMessage, app.currentChatId]
	);

	const observer = new IntersectionObserver(observerCallback, {
		threshold: 0.5, // Trigger when 50% of the element is in the viewport
	});

	return observer;
};
