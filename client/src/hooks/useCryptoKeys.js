import { NEW_EVENT_REQUEST_PUBLIC_KEY } from '../../../constants.json';
import { convertArrayBufferToPem } from 'src/lib/chatHelper';
import { socket } from 'src/lib/socketConnection';
import { useState } from 'react';

// Custom hook to handle cryptographic key operations
const useCryptoKeys = (currentChatId) => {
	// State variables to store keys
	const [importedPublicKey, setImportedPublicKey] = useState(null);
	const [importedPrivateKey, setImportedPrivateKey] = useState(null);
	const [cryptoKey, setCryptoKey] = useState(null);
	const [messageIsDecrypting, setMessageIsDecrypting] = useState(false);

	const storedCryptoKey = localStorage.getItem('cryptoKey' + currentChatId);
	const storedPublicKey = localStorage.getItem('importPublicKey' + currentChatId);
	const storedPrivateKey = localStorage.getItem('importedPrivateKey' + currentChatId);

	// Function to import public and private keys
	const importKey = async (publicArrayBuffer, privateArrayBuffer) => {
		const storedPublicKey = localStorage.getItem('importPublicKey' + currentChatId);
		const storedPrivateKey = localStorage.getItem('importedPrivateKey' + currentChatId);

		// Import public key
		const getImportedPublicKey = await crypto.subtle.importKey(
			'spki',
			publicArrayBuffer,
			{
				name: 'RSA-OAEP',
				hash: { name: 'SHA-256' },
			},
			true,
			['encrypt']
		);

		// Import private key
		const getImportedPrivateKey = await crypto.subtle.importKey(
			'pkcs8',
			privateArrayBuffer,
			{
				name: 'RSA-OAEP',
				hash: { name: 'SHA-256' },
			},
			true,
			['decrypt']
		);

		// Store public key in local storage if not already stored
		if (!storedPublicKey) {
			const exportedPublicKey = await crypto.subtle.exportKey('spki', getImportedPublicKey);
			const publicKeyArray = new Uint8Array(exportedPublicKey);
			localStorage.setItem(
				'importPublicKey' + currentChatId,
				JSON.stringify(Array.from(publicKeyArray))
			);
		}

		// Store private key in local storage if not already stored
		if (!storedPrivateKey) {
			const exportedPrivateKey = await crypto.subtle.exportKey('pkcs8', getImportedPrivateKey);
			const privateKeyArray = new Uint8Array(exportedPrivateKey);
			localStorage.setItem(
				'importedPrivateKey' + currentChatId,
				JSON.stringify(Array.from(privateKeyArray))
			);
		}
		setImportedPublicKey(getImportedPublicKey);
		setImportedPrivateKey(getImportedPrivateKey);
		setMessageIsDecrypting(false);
	};

	// Function to generate a new key pair
	const generateKeyPair = async () => {
		setMessageIsDecrypting(true);
		let pemPrivateKey;

		// Generate a new RSA key pair
		const keyPair = await crypto.subtle.generateKey(
			{
				name: 'RSA-OAEP',
				modulusLength: 2048,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: 'SHA-256',
			},
			true,
			['encrypt', 'decrypt']
		);

		// If a private key is already stored, import it
		if (storedCryptoKey) {
			const privateKeyArray = new Uint8Array(JSON.parse(storedCryptoKey));

			const importedPrivateKey = await crypto.subtle.importKey(
				'pkcs8',
				privateKeyArray.buffer,
				{
					name: 'RSA-OAEP',
					hash: { name: 'SHA-256' },
				},
				true,
				['decrypt']
			);
			setCryptoKey(importedPrivateKey);
		} else {
			// Otherwise, use the newly generated private key
			setCryptoKey(keyPair.privateKey);

			const exportedPrivateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
			const privateKeyArray = new Uint8Array(exportedPrivateKey);
			pemPrivateKey = convertArrayBufferToPem(exportedPrivateKey, 'PRIVATE KEY');

			localStorage.setItem(
				'cryptoKey' + currentChatId,
				JSON.stringify(Array.from(privateKeyArray))
			);
		}

		const exportedPublicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
		const pemPublicKey = convertArrayBufferToPem(exportedPublicKey, 'PUBLIC KEY');

		// If public and private keys are stored, import them
		if (storedPublicKey && storedPrivateKey) {
			const publicKeyArray = new Uint8Array(JSON.parse(storedPublicKey));
			const privateKeyArray = new Uint8Array(JSON.parse(storedPrivateKey));
			importKey(publicKeyArray, privateKeyArray);
		} else {
			// Otherwise, emit an event to request the public key
			// emitting the public and private key to all receiver's. We need to emit private key
			// because we need to able to decrypt messages that we sent because we
			// encrypt messages with receiver's public key
			socket.emit(NEW_EVENT_REQUEST_PUBLIC_KEY, {
				chatId: currentChatId,
				publicKey: pemPublicKey,
				privateKey: pemPrivateKey,
			});
		}
	};

	// Return keys and functions from the hook
	return {
		importedPublicKey,
		importedPrivateKey,
		cryptoKey,
		messageIsDecrypting,
		generateKeyPair,
		importKey,
	};
};

export default useCryptoKeys;
