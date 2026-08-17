import { useEffect } from 'react';

// Warns the user with the browser's native confirmation dialog before they
// close/refresh the tab while shouldWarn is true (e.g. an active chat exists)
const useWarnBeforeUnload = (shouldWarn) => {
	useEffect(() => {
		if (!shouldWarn) {
			return;
		}

		const handleBeforeUnload = (event) => {
			event.preventDefault();
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [shouldWarn]);
};

export default useWarnBeforeUnload;
