import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useDialog } from 'src/context/DialogContext';

import 'styles/dialog.css';
import { useDarkMode } from 'src/context/DarkModeContext';

const Dialog = ({ ...rest }) => {
    const { dialog, setDialog } = useDialog();
    const { isOpen, text, handler, noBtnText, yesBtnText } = dialog;

    const { darkMode } = useDarkMode();

    const resetDialog = () => {
        setDialog({ isOpen: false, text: '', handler: null });
    };

    const handleYesClick = () => {
        handler?.();
        resetDialog();
    };

    const handleNoClick = () => {
        resetDialog();
    };

    useEffect(() => {
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                resetDialog();
            }
        };
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [resetDialog]);

    if (!isOpen) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className={`${darkMode && 'dark'}`}>
            <div
                id="overlay"
                className="dialog-overlay"
                onClick={resetDialog}
            />
            <dialog open={isOpen} {...rest} className="dialog-container">
                <p className="text-primary dark:text-white text-[1rem]">
                    {text || 'Are you sure?'}
                </p>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="dialog-btn bg-gray-100 dark:bg-primary text-primary dark:text-white"
                        onClick={handleNoClick}
                    >
                        {noBtnText || 'Cancel'}
                    </button>
                    <button
                        className="dialog-btn bg-[#FF9F1C]"
                        onClick={handleYesClick}
                    >
                        {yesBtnText || 'Confirm'}
                    </button>
                </div>
            </dialog>
        </div>,
        document.getElementById('portal')
    );
};

export default Dialog;

Dialog.propTypes = {
    children: PropTypes.node.isRequired,
};
