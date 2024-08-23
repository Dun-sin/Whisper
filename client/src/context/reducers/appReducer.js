import { cloneState } from './utils';

export default function chatReducer(state, action) {
	const clonedState = cloneState(state);

	switch (action.type) {
		case 'CANCEL_SETTINGS_UPDATE': {
			clonedState.tmpSettings = null;
			break;
		}

		case 'UPDATE_SETTINGS': {
			Object.assign(clonedState.settings, action.payload);
			break;
		}

		case 'UPDATE_TMP_SETTINGS': {
			clonedState.tmpSettings = action.payload;
			break;
		}

		case 'START_SEARCHING': {
			clonedState.isSearching = true;
			clonedState.currentChatId = null;
			break;
		}

		case 'STOP_SEARCHING': {
			const { currentChatId } = action.payload;

			clonedState.isSearching = false;
			clonedState.currentChatId = currentChatId;
			break;
		}

		case 'ONLINE_STATUS': {
			const { onlineStatus } = action.payload;

			clonedState.onlineStatus = onlineStatus;
			break;
		}

		default:
			throw new Error('No action provided!');
	}

	// Save auth state to localStorage on each change
	localStorage.setItem('app', JSON.stringify(clonedState));

	return clonedState;
}
