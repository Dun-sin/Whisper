import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const DialogContext = createContext(null);

function DialogProvider({ children, ...props }) {
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

export { DialogContext, DialogProvider };
