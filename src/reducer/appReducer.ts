import { cloneState } from '@/lib/utils';
import { AppType } from '@/types/types';

export const initialState: AppType = {
  settings: {
    notificationsEnabled: true,
    notificationVolume: 10,
    theme: true,
  },
  tmpSettings: {},
  currentRoomId: null,
  isSearching: false,
  onlineStatus: null,
  disconnected: false,
};

export default function appReducer(state: AppType, action: any) {
  const clonedState = cloneState(state);

  switch (action.type) {
    case 'CANCEL_SETTINGS_UPDATE': {
      clonedState.tmpSettings = {};
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
      clonedState.currentRoomId = null;
      break;
    }

    case 'STOP_SEARCHING': {
      const { currentRoomId } = action.payload;

      clonedState.isSearching = false;
      clonedState.currentRoomId = currentRoomId;
      break;
    }

    case 'ONLINE_STATUS': {
      const { onlineStatus } = action.payload;

      clonedState.onlineStatus = onlineStatus;
      break;
    }

    case 'DISCONNECTED': {
      const { disconnected } = action.payload;

      clonedState.disconnected = disconnected;
      break;
    }
    default:
      throw new Error('No action provided!');
  }

  // Save auth state to localStorage on each change
  localStorage.setItem('app', JSON.stringify(clonedState));

  return clonedState;
}
