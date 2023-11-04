import { useEffect, useState } from 'react';

/*
 * {timeInMilliseconds} is the time to track e.g 5 o'clock
 * {timeToCheck} is the time to track against also in ms e.g 3 minutes
 */
export default (timeInMilliseconds: number, timeToCheck: number) => {
	const [timePassed, setTimePassed] = useState(false);
	const [timer, setTimer] = useState<
		undefined | ReturnType<typeof setInterval>
	>();

	// Function to clear the timer externally
	const clearTimer = () => {
		if (!timer) return;
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

		let timerId: undefined | ReturnType<typeof setInterval> = undefined;
		timerId = setInterval(checkTime, 1000);

		// set the interval to state
		if (!timerId) return;
		setTimer(timerId);

		return () => {
			clearInterval(timerId);
		};
	}, [timeInMilliseconds]);

	if (!timeInMilliseconds) {
		return { timePassed: false, clearTimer };
	}

	return { timePassed, clearTimer };
};
