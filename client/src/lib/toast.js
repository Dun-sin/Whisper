import { toast } from 'react-hot-toast';

export const showSuccess = (msg) => {
	toast.success(msg, {
		style: {
			background: '#4caf50',
			color: '#fff',
		},
	});
};

export const showError = (msg) => {
	toast.error(msg, {
		style: {
			background: '#f44336',
			color: '#fff',
		},
	});
};
