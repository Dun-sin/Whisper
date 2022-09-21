import { createContext, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';

import authReducer from './reducers/authReducer';

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
const initialState = {
    isLoggedIn: false,
    loginType: 'anonymous',
    loginId: null,
    email: null,
};

const AuthContext = createContext({
    ...initialState,
    login: () => undefined,
    logout: () => undefined,
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(
        authReducer,
        initialState,
        (defaultState) => {
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
    );

    const isLoggedIn = useMemo(() => {
        return state.isLoggedIn && state.loginId !== null;
    });

    function login({ loginId, email, loginType }) {
        dispatch({
            type: 'LOGIN',
            payload: {
                loginId,
                email,
                loginType,
            },
        });
    }

    function logout() {
        dispatch({
            type: 'LOGOUT',
        });
    }

    return (
        <AuthContext.Provider
            value={{ auth: state, isLoggedIn, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Eslint forced me to do this :(
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
