import { flattenDeep, uniq } from 'lodash';

import crypto from 'crypto-js';

const key = import.meta.env.VITE_SECRET_KEY;

/**
 *
 * @param {any[]} classes
 * @returns
 */
export function createClassesFromArray(...classes) {
	return uniq(flattenDeep(classes)).filter(Boolean).join(' ');
}

/**
 * Checks if the socket was explicitly disconnected or due to connection issues
 * @param {string} reason Reason for socket disconnection
 */
export function isExplicitDisconnection(reason) {
	const explicitReasons = ['io server disconnect', 'io client disconnect'];

	return explicitReasons.includes(reason);
}

// Generates 6 random code
export function generateCode() {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	const charactersLength = characters.length;

	for (let i = 0; i < 6; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}

export const encrypt = (text) => {
	return crypto.AES.encrypt(text, key).toString();
};

export const decrypt = (encryptedText) => {
	const bytes = crypto.AES.decrypt(encryptedText, key);
	const originalText = bytes.toString(crypto.enc.Utf8);

	return originalText;
};

export const validateUserID = (userID, userType) => {
	const userIDPattern = /^[a-z0-9]{12}$/;
	const userHexIdPattern = /^[a-f0-9]{24}$/;
	
	if (userType === 'email') {
		// user id validation for hex pattern of email login
		return userHexIdPattern.test(userID);
	} else {
		// user id validation for anonymous login
		return userIDPattern.test(userID);
	}
};