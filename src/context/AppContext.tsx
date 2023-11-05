import React, { createContext, useContext, useMemo, useReducer } from 'react';

import { isEqual } from 'lodash';

import appReducer, { initialState } from '@/reducer/appReducer';

import { SettingsType, AppType } from '@/types/types';
import { ProviderType } from '@/types/propstypes';

const AppContext = createContext<{
  app: AppType;
  hasUnsavedSettings: boolean;
  updateSettings: () => undefined;
  updateTmpSettings: (newSettings: SettingsType) => void;
  cancelSettingsUpdate: () => void;
  startSearch: () => undefined;
  endSearch: (currentChatId: null | string) => undefined;
  loadUserSettings: (settings: SettingsType) => void;
  updateOnlineStatus: (onlineStatus: Date | string | null) => void;
}>({
  app: initialState,
  hasUnsavedSettings: false,
  updateSettings: () => undefined,
  updateTmpSettings: () => {},
  cancelSettingsUpdate: () => {},
  startSearch: () => undefined,
  endSearch: () => undefined,
  loadUserSettings: () => {},
  updateOnlineStatus: () => {},
});

export const useApp = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }: ProviderType) => {
  const [state, dispatch] = useReducer(
    appReducer,
    initialState,
    defaultState => {
      try {
        const persistedState = JSON.parse(
          localStorage.getItem('app') as string
        );

        if (!persistedState) {
          return defaultState;
        }

        return persistedState;
      } catch {
        return defaultState;
      }
    }
  );

  const hasUnsavedSettings = useMemo(() => {
    return (
      Boolean(state.tmpSettings) && !isEqual(state.settings, state.tmpSettings)
    );
  }, [state.settings, state.tmpSettings]);

  function updateSettings(): undefined {
    if (!state.tmpSettings) {
      return;
    }

    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: state.tmpSettings,
    });

    dispatch({
      type: 'CANCEL_SETTINGS_UPDATE',
    });
  }

  function loadUserSettings(settings: SettingsType) {
    if (!settings) {
      return;
    }
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: settings,
    });
  }

  function updateTmpSettings(newSettings: SettingsType) {
    dispatch({
      type: 'UPDATE_TMP_SETTINGS',
      payload: state.tmpSettings
        ? { ...state.tmpSettings, ...newSettings }
        : newSettings,
    });
  }

  function cancelSettingsUpdate() {
    dispatch({
      type: 'CANCEL_SETTINGS_UPDATE',
    });
  }

  function startSearch(): undefined {
    dispatch({
      type: 'START_SEARCHING',
    });
  }

  function endSearch(currentChatId: string | null = null): undefined {
    dispatch({
      type: 'STOP_SEARCHING',
      payload: { currentChatId },
    });
  }

  function updateOnlineStatus(onlineStatus: Date | string | null) {
    dispatch({
      type: 'ONLINE_STATUS',
      payload: { onlineStatus },
    });
  }

  return (
    <AppContext.Provider
      value={{
        app: state,
        hasUnsavedSettings,
        updateSettings,
        updateTmpSettings,
        cancelSettingsUpdate,
        startSearch,
        endSearch,
        loadUserSettings,
        updateOnlineStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
