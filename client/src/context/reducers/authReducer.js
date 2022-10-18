import { cloneState } from './utils';

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
            break;
        }

        case 'LOGOUT':
            localStorage.clear();

            return {
                ...cloneState,
                email: null,
                loginId: null,
                loginType: 'anonymous',
                isLoggedIn: false,
            };

        default:
            throw new Error('No action provided!');
    }

    // Save auth state to localStorage on each change
    localStorage.setItem('auth', JSON.stringify(clonedState));

    return clonedState;
}
