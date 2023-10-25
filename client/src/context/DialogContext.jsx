import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const initialState = {
	isOpen: false,
	text: '',
	handler: () => undefined,
	noBtnText: '',
	yesBtnText: '',
};

const DialogContext = createContext({
	dialog: { ...initialState },
	// Tried to add typehint but eslint complains so I had to do this.
	// eslint-disable-next-line no-unused-vars
	setDialog: (_options = { ...initialState }) => undefined,
});

export const useDialog = () => useContext(DialogContext);

export function DialogProvider({ children, ...props }) {
	const [dialog, setDialog] = useState({
		isOpen: false,
		text: '',
		handler: null,
		noBtnText: '',
		yesBtnText: '',
	});

	return (
		<DialogContext.Provider value={{ dialog, setDialog }} {...props}>
			{children}
		</DialogContext.Provider>
	);
}

DialogProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
