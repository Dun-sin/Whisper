import { createContext, useContext, useMemo, useReducer } from 'react';

import authReducer, { initialState } from '@/reducer/authReducer';

import { AuthType } from '@/types/types';
import { ProviderType } from '@/types/propstypes';
import { AuthContextType } from '@/types/contextTypes';

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

const AuthContext = createContext<AuthContextType>({
  authState: initialState,
  dispatchAuth: () => {},
  isLoggedIn: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a ContentProvider');
  }
  return context;
};

const initializeAuthState: unknown = (defaultState: AuthType): AuthType => {
  try {
    if (typeof window !== 'undefined') {
      const persistedState = JSON.parse(localStorage.getItem('auth') as string);

      if (!persistedState) {
        return defaultState;
      }

      if (!persistedState.loginId && persistedState.isLoggedIn === true) {
        throw new Error('Gotcha! :D');
      }

      return persistedState;
    } else {
      return defaultState;
    }
  } catch {
    return defaultState;
  }
};

export const AuthProvider = ({ children }: ProviderType) => {
  const [authState, dispatchAuth] = useReducer(
    authReducer as React.Reducer<AuthType, any>,
    initialState,
    initializeAuthState as undefined
  );

  const isLoggedIn = useMemo(() => {
    return authState.isLoggedIn && authState.loginId !== null;
  }, [authState.isLoggedIn, authState.loginId]);

  const contextValue = {
    authState,
    dispatchAuth,
    isLoggedIn,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
