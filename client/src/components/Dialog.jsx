import React, { useContext, useEffect} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DialogContext } from 'src/context/DialogContext';

import "styles/dialog.css"

const Dialog = ({ ...rest }) => {
    const { dialog, setDialog } = useContext(DialogContext);
    const { isOpen, text, handler, noBtnText, yesBtnText } = dialog;

    const resetDialog = () => {
        setDialog({ isOpen: false, text: '', handler: null });
    };

    const handleYesClick = () => {
        handler();
        resetDialog();
    };

    const handleNoClick = () => {
        resetDialog();
    };

    useEffect(() => {
        const handleKeydown = (e) => {
          if (e.key === "Escape") {
            resetDialog();
        }};
        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
      }, [resetDialog]);

    if (!isOpen) {
        return null;
    }

    return ReactDOM.createPortal(
        <>
            <div id="overlay" className="dialog-overlay" onClick={resetDialog} />
            <dialog open={isOpen} {...rest} className="dialog-container">
                <p className="text-white text-[1rem]">{text}</p>

                <div className="flex justify-end gap-2 mt-6">
                    <button className="dialog-btn bg-primary" onClick={handleNoClick}>{noBtnText}</button>
                    <button className="dialog-btn bg-[#FF9F1C]" onClick={handleYesClick}>{yesBtnText}</button>
                </div>
            </dialog>
        </>
        ,
        document.getElementById('portal')
    );
};

export default Dialog;

Dialog.propTypes = {
    children: PropTypes.node.isRequired,
};
