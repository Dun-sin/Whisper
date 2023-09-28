import { cloneState } from './utils';

export const initialState = {
    isLoggedIn: false,
    loginType: 'anonymous',
    loginId: null,
    email: null,
};

export default function authReducer(state, action) {
    const clonedState = cloneState(state);

    switch (action.type) {
        case 'LOGIN': {
            const { email, loginId, loginType } = action.payload;

            Object.assign(clonedState, {
                email,
                loginId,
                loginType,
                isLoggedIn: true,
            });
            // Save auth state to localStorage on each change
            localStorage.setItem('auth', JSON.stringify(clonedState));

            return clonedState;
        }

        case 'LOGOUT':
            localStorage.clear();

            return {
                ...clonedState,
                email: null,
                loginId: null,
                loginType: 'anonymous',
                isLoggedIn: false,
            };

        default:
            throw new Error('No action provided!');
    }

}
