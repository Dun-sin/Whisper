import { cloneState } from './utils';
import {toast} from 'react-toastify';
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
            localStorage.removeItem('auth');
            

            toast.error('Logged out successfully', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });
                

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
