import { createContext, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';

import authReducer, { initialState } from './reducers/authReducer';

const AuthContext = createContext({
    ...initialState,
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a ContentProvider');
    }
    return context;
};

const initializeAuthState = (defaultState) => {
    try {
        const persistedState = JSON.parse(localStorage.getItem('auth'));

        if (!persistedState) {
            return defaultState;
        }

        /**
         * TODO: Validate loginId to be a valid uuid using the uuid
         *       library from npm
         */
        if (
            !persistedState.loginId &&
            persistedState.isLoggedIn === true
        ) {
            // User is trying to hack app by manipulating localStorage
            throw new Error('Gotcha! :D');
        }

        return persistedState;
    } catch {
        return defaultState;
    }
}

export const AuthProvider = ({ children }) => {
    const [authState, dispatchAuth] = useReducer(
        authReducer,
        initialState,
        initializeAuthState
    );

    const isLoggedIn = useMemo(() => {
        return authState.isLoggedIn && authState.loginId !== null;
    }, [authState.isLoggedIn, authState.loginId]);

    const contextValue = {
        authState, dispatchAuth, isLoggedIn
    }

    return (
        <AuthContext.Provider
            value={contextValue}
        >
            {children}
        </AuthContext.Provider>
    );
};


AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};


/**
 * Changed the state from a boolean type to an object. This helps improve
 * security and user identification for each login.
 * Each property of the state is explained in detail below.
 *
 *
 * isLoggedIn:  Self explanatory (Tells whether user is currently logged in or
 *              not)
 *
 *  loginType:  Accepted values: (anonymous, email). Tells whether user logged
 *              in anonymously or via email
 *
 *    loginId:  A string containing a token generated after a successful login.
 *              Added as a security measure to prevent any user from viewing
 *              other users' messages.
 *              This is because by using only email (previous solution) to
 *              identify users, any user can view other users' messages by
 *              setting localStorage.auth.email property to their target's email
 *
 *      email:  Email for the logged in user (email logins only). Would be null
 *              for anonymous users
 *
 */
