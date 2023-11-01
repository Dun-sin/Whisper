import { useEffect, useState } from 'react';

import { createBrowserNotification } from 'src/lib/browserNotification';
import useCheckTimePassed from './useCheckTimePassed';
import { isGreaterThan3Minutes } from 'src/lib/chatHelper';

const inactiveTimeThreshold = 180000;

export default (getLastMessage, amITheSender) => {
	const [lastMessageTime, setLastMessageTime] = useState(null);
	const { timePassed, clearTimer } = useCheckTimePassed(lastMessageTime, inactiveTimeThreshold);


	useEffect(() => {
		if (
			amITheSender === null
			|| amITheSender === undefined
			|| !getLastMessage) {
			return
		}

		// get the time of the last message
		const newMessageTime = getLastMessage.time;

		// if the lastMessageTime stored in state is the same as
		// the newmessagetime then we return
		// if the newMessageTime is greater than 3 minutes we also return
		// this is so that the hook doesn't always run on render
		if (newMessageTime === lastMessageTime
			|| isGreaterThan3Minutes(inactiveTimeThreshold, newMessageTime)
		) {
			return;
		}

		setLastMessageTime(newMessageTime);
	}, [getLastMessage]);


	useEffect(() => {
		if (timePassed) {
			if (amITheSender) {
				createBrowserNotification('Inactive Chat', `Your Partner isn't responding, want to leave?`)
			} else if (!amITheSender) {
				createBrowserNotification('Inactive Chat', `You haven't replied your partner yet`)
			} else {
				return
			}

			clearTimer();
			setLastMessageTime(null);
		}
	}, [timePassed]);
}
