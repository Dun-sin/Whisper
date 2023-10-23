import CryptoJS from 'crypto-js';

const secretKey = import.meta.env.VITE_SECRET_KEY;

export default (message) => {
	const bytes = CryptoJS.AES.decrypt(message, secretKey);
	const originalMessage = bytes.toString(CryptoJS.enc.Utf8);

	return originalMessage;
};
