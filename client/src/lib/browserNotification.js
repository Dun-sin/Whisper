import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/data/en.json';

export const requestBrowserNotificationPermissions = async () => {
	if (!('Notification' in window)) {
		console.log('Browser does not support desktop notification');
	} else {
		const res = await Notification.requestPermission();
		if (res === 'granted') {
			return true;
		} else {
			return false;
		}
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
		if (badwords.check(body)) {
			const message = badwords.filter(body);
			new Notification(title, {
				body: message,
				icon: '/favicon.ico',
			});

			return;
		}
	}

	new Notification(title, {
		body,
		icon: '/favicon.ico',
	});
};
