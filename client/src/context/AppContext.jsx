import { createContext, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

import appReducer from './reducers/appReducer';

const initialState = {
    settings: {
        notificationsEnabled: true,
        notificationVolume: 10,
    },
    tmpSettings: null,
};

const AppContext = createContext({
    ...initialState,
    updateSettings: () => undefined,
});

export const useApp = () => {
    return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(
        appReducer,
        initialState,
        (defaultState) => {
            try {
                const persistedState = JSON.parse(localStorage.getItem('app'));

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
            Boolean(state.tmpSettings) &&
            !isEqual(state.settings, state.tmpSettings)
        );
    });

    function updateSettings() {
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

    function updateTmpSettings(newSettings) {
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

    return (
        <AppContext.Provider
            value={{
                app: state,
                hasUnsavedSettings,
                updateSettings,
                updateTmpSettings,
                cancelSettingsUpdate,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

// Eslint forced me to do this :(
AppProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
