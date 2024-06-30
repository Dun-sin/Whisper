import { useEffect, useState, useCallback } from 'react';

export default (timeInMilliseconds, timeToCheck, onTimePass, interval = 1000) => {
	const [timePassed, setTimePassed] = useState(false);
	const [timer, setTimer] = useState(null);

	// Function to clear the timer externally
	const clearTimer = useCallback(() => {
		clearInterval(timer);
		setTimer(null);
		setTimePassed(false);
	}, [timer]);

	// Function to pause the timer
	const pauseTimer = useCallback(() => {
		clearInterval(timer);
		setTimer(null);
	}, [timer]);

	// Function to resume the timer
	const resumeTimer = useCallback(() => {
		if (!timer) {
			setTimer(setInterval(checkTime, interval));
		}
	}, [timer, interval]);

	// Function to reset the timer
	const resetTimer = useCallback(() => {
		clearInterval(timer);
		setTimer(null);
		setTimePassed(false);
		if (timeInMilliseconds) {
			setTimer(setInterval(checkTime, interval));
		}
	}, [timer, timeInMilliseconds, interval]);

	// Function to check the time difference
	const checkTime = useCallback(() => {
		const currentTime = Date.now();
		const timeDifference = currentTime - timeInMilliseconds;
		const hasTimePassed = timeDifference >= timeToCheck;
		setTimePassed(hasTimePassed);
		if (hasTimePassed && onTimePass) {
			onTimePass();
		}
	}, [timeInMilliseconds, timeToCheck, onTimePass]);

	useEffect(() => {
		if (!timeInMilliseconds) {
			return;
		}

		setTimer(setInterval(checkTime, interval));

		return () => clearInterval(timer);
	}, [timeInMilliseconds, checkTime, interval]);

	if (!timeInMilliseconds) {
		return { timePassed: false, clearTimer, pauseTimer, resumeTimer, resetTimer };
	}

	return { timePassed, clearTimer, pauseTimer, resumeTimer, resetTimer };
};
