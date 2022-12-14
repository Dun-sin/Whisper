import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useDialog } from 'src/context/DialogContext';
import useTheme from 'src/hooks/useTheme';

import 'styles/dialog.css';

const Dialog = ({ ...rest }) => {
    const { dialog, setDialog } = useDialog();
    const { isOpen, text, handler, noBtnText, yesBtnText } = dialog;

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

    const context = useTheme();
    const light = context.theme === 'light';
    return ReactDOM.createPortal(
        <>
            <div
                id="overlay"
                className="dialog-overlay"
                onClick={resetDialog}
            />
            <dialog
                open={isOpen}
                {...rest}
                className={`dialog-container ${
                    light && 'dialog-container-light'
                }`}
            >
                <p
                    className={`${
                        light && 'text-black'
                    } text-white text-[1rem]`}
                >
                    {text || 'Are you sure?'}
                </p>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="dialog-btn bg-primary"
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
        </>,
        document.getElementById('portal')
    );
};

export default Dialog;

Dialog.propTypes = {
    children: PropTypes.node.isRequired,
};
