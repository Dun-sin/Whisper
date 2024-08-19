import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ImCancelCircle } from 'react-icons/im';
import { IoSend } from 'react-icons/io5';
import { IoIosArrowDropright } from 'react-icons/io';
import EmojiPicker from '../EmojiPicker';
import useKeyPress, { ShortcutFlags } from 'src/hooks/useKeyPress';

import { socket } from 'src/lib/socketConnection';
import { NEW_EVENT_SEND_FAILED } from '../../../../constants.json';
import { useChat } from 'src/context/ChatContext';
import { useAuth } from 'src/context/AuthContext';

const MessageInput = ({
	inputRef,
	message,
	handleTypingStatus,
	setMessage,
	editing,
	cancelEdit,
	handleSubmit,
}) => {
	const [isTextAreaDisabled, setTextAreaDisabled] = useState(false);
	const { currentReplyMessage, currentReplyMessageId, scrollToMessage, cancelReply } = useChat();
	const { authState } = useAuth();
	const senderId = authState.loginId;

	// Define the limitMessageHandler function
	function limitMessageHandler() {
		setTextAreaDisabled(true);
		let timer = 60;

		const countdownInterval = setInterval(() => {
			timer -= 1;
			if (timer <= 0) {
				setTextAreaDisabled(false);
				clearInterval(countdownInterval);
			}
		}, 1000);
	}

	useEffect(() => {
		socket.on(NEW_EVENT_SEND_FAILED, limitMessageHandler);

		return () => {
			socket.off(NEW_EVENT_SEND_FAILED, limitMessageHandler);
		};
	}, []);

	// Create a function to handle "Ctrl + Enter" key press
	const handleCtrlEnter = (e) => {
		if (e.ctrlKey && e.key === 'Enter') {
			handleSubmit(e);
		}
	};

	// Use the useKeyPress hook to listen for "Ctrl + Enter" key press
	useKeyPress(['Enter'], handleCtrlEnter, ShortcutFlags.ctrl);

};

MessageInput.propTypes = {
	inputRef: PropTypes.object.isRequired,
	message: PropTypes.string.isRequired,
	handleTypingStatus: PropTypes.func.isRequired,
	setMessage: PropTypes.func.isRequired,
	editing: PropTypes.object.isRequired,
	cancelEdit: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};

export default MessageInput;
