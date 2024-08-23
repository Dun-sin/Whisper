import axios from 'axios';

const api = axios.create({
	baseURL: import.meta.env.VITE_SOCKET_URL,
	headers: {
		Accept: 'application/json',
	},
});

export { api };
