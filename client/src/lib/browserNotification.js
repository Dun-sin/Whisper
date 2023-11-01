import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/data/en.json'
import decryptMessage from './decryptMessage';

export const requestBrowserNotificationPermissions = () => {
	if (!('Notification' in window)) {
		console.log('Browser does not support desktop notification');
	} else {
		Notification.requestPermission();
	}
};

export const createBrowserNotification = (title, body) => {
	const badwords = new BadWordsNext({ data: en });

	if (Notification.permission === 'denied') {
		return;
	}

	if (document.visibilityState === 'visible' && document.hasFocus()) {
		return;
	}

	if (title !== 'Inactive Chat') {
		if (badwords.check(decryptMessage(body))) {
			const message = badwords.filter(decryptMessage(body));
			new Notification(title, {
				body: message,
				icon: '/favicon.ico',
			});

			return;
		}
		body = decryptMessage(body);
	}

	new Notification(title, {
		body,
		icon: '/favicon.ico',
	});
};
