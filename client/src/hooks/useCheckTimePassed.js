import { useEffect, useState } from 'react';

/*
 * {timeInMilliseconds} is the time to track e.g 5 o'clock
 * {timeToCheck} is the time to track against also in ms e.g 3 minutes
 */
export default (timeInMilliseconds, timeToCheck) => {
	const [timePassed, setTimePassed] = useState(false);
	const [timer, setTimer] = useState(null);

	// Function to clear the timer externally
	const clearTimer = () => {
		clearInterval(timer);
		return { timePassed: false, clearTimer };
	};

	useEffect(() => {
		if (!timeInMilliseconds) {
			return;
		}

		// check if the time if it's greater or equal to the `timeToCheck`
		const checkTime = () => {
			const currentTime = Date.now();
			const timeDifference = currentTime - timeInMilliseconds;
			setTimePassed(timeDifference >= timeToCheck);
		};

		// set the interval to state
		setTimer(setInterval(checkTime, 1000));
	}, [timeInMilliseconds]);

	if (!timeInMilliseconds) {
		return { timePassed: false, clearTimer };
	}

	return { timePassed, clearTimer };
};
