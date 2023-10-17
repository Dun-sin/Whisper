import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useDialog } from 'src/context/DialogContext';

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
                className="z-50 fixed inset-0 bg-black opacity-60"
                onClick={resetDialog}
            />
            <dialog open={isOpen} {...rest} className="z-50 rounded-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 bg-light dark:bg-secondary w-[90%] md:w-auto md:max-w-md px-6 py-6">
                <p className="text-primary dark:text-white text-[1rem]">
                    {text || 'Are you sure?'}
                </p>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="hover:opacity-80 text-white px-4 py-2 rounded-lg bg-gray-100 dark:bg-primary text-primary dark:text-white"
                        onClick={handleNoClick}
                    >
                        {noBtnText || 'Cancel'}
                    </button>
                    <button
                        className="hover:opacity-80 text-white px-4 py-2 rounded-lg bg-[#FF9F1C]"
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
