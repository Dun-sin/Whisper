import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/data/en.json';
import decryptMessage from './decryptMessage';

export const requestBrowserNotificationPermissions = () => {
	if (!('Notification' in window)) {
		console.log('Browser does not support desktop notification');
	} else {
		Notification.requestPermission();
	}
};

export const createBrowserNotification = (title: string, body: string) => {
	const badwords = new BadWordsNext({ data: en });

	if (Notification.permission === 'denied') {
		return;
	}

	if (document.visibilityState === 'visible' && document.hasFocus()) {
		return;
	}

	if (title !== 'Inactive Chat') {
		const decryptedMessage = decryptMessage(body) as string;
		if (badwords.check(decryptedMessage)) {
			const message = badwords.filter(decryptedMessage);
			new Notification(title, {
				body: message,
				icon: '/favicon.ico',
			});

			return;
		}
		body = decryptedMessage;
	}

	new Notification(title, {
		body,
		icon: '/favicon.ico',
	});
};
