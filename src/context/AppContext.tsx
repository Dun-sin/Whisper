import React, { createContext, useContext, useMemo, useReducer } from 'react';

import { isEqual } from 'lodash';

import appReducer, { initialState } from '@/reducer/appReducer';

import { SettingsType } from '@/types/types';
import { ProviderType } from '@/types/propstypes';
import { AppContextType } from '@/types/contextTypes';

const AppContext = createContext<AppContextType>({
  app: initialState,
  hasUnsavedSettings: false,
  updateSettings: () => undefined,
  updateTmpSettings: () => {},
  cancelSettingsUpdate: () => {},
  startSearch: () => undefined,
  endSearch: () => undefined,
  loadUserSettings: () => {},
  updateOnlineStatus: () => {},
  updateConnection: () => {},
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
         if (typeof window !== 'undefined') {
           const persistedState = JSON.parse(
             localStorage.getItem('app') as string
           );

           if (!persistedState) {
             return defaultState;
           }

           return persistedState;
         } else {
           return defaultState;
         }
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
  function updateConnection(isDisconnected: boolean) {
    dispatch({
      type: 'DISCONNECTED',
      payload: { disconnected: isDisconnected },
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
        updateConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
