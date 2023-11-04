import { AuthType } from '@/types';
import { cloneState } from '@/lib/utils';

export const initialState: AuthType = {
	isLoggedIn: false,
	loginType: 'anonymous',
	loginId: '',
	email: null,
};

export default function authReducer(state: AuthType, action: any) {
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
