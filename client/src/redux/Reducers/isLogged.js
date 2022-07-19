import { createSlice } from '@reduxjs/toolkit';

/**
 * Changed the state from a boolean type to an object. This helps improve security
 * and user identification for each login.
 * Each property of the state is explained in detail below.
 * 
 * 
 * isLoggedIn:  Self explanatory (Tells whether user is currently logged in or not)
 * 
 *  loginType:  Accepted values: (anonymous, email). Tells whether user logged in anonymously or via email
 * 
 *    loginId:  A string containing a token generated after a successful login.
 *              Added as a security measure to prevent any user from viewing other users' messages. 
 *              This is because by using only email (previous solution) to identify users, any user can view other users' 
 *              messages by setting localStorage.auth.email property to their target's email
 * 
 *      email:  Email for the logged in user (email logins only). Would be null for anonymous users
 * 
 */
const initialState = {
	isLoggedIn: false,
	loginType: 'anonymous',
	loginId: null,
	email: null,
};

const options = {
	name: 'isLogged',
	initialState,
	reducers: {
		changeIsLogged: (state, action) => {
			const { payload } = action

			/**
			 * TODO: Validate loginId to be a valid uuid using the uuid library from npm
			 */
			if (!payload.loginId && payload.isLoggedIn === true) {
				// User is trying to hack app by manipulating localStorage
				throw new Error('Gotcha! "ANon Chat App" is "ANon Hackable App"! :D')
			}

			return Object.assign(state, payload)
		},
	},
};

export const isLoggedSlice = createSlice(options);

export const { changeIsLogged } = isLoggedSlice.actions;

export default isLoggedSlice.reducer;
