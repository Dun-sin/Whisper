import React from 'react';

import PropTypes from 'prop-types';
import Dropdown from 'rsuite/Dropdown';

import { BiDotsVerticalRounded } from 'react-icons/bi';

import chatHelper from 'src/lib/chatHelper';

import { useChat } from 'src/context/ChatContext';
import { useApp } from 'src/context/AppContext';
import { socket } from 'src/lib/socketConnection';

import useChatUtils from 'src/lib/chatSocket';

const DropDownOptions = ({ id, isSender, inputRef, cancelEdit, setEditing, setReplyId }) => {
	const { app } = useApp();

	const { messages: state, updateMessage, removeMessage } = useChat();
	const { getMessage, messageExists, handleCopyToClipBoard } = chatHelper(state, app);
	const { deleteMessage } = useChatUtils(socket);

	const handleEdit = (id) => {
		inputRef.current.focus();
		const { message } = getMessage(id, state, app);

		if (message.includes('Warning Message')) {
			cancelEdit();
			return;
		}
		inputRef.current.value = message;

		setEditing({ isediting: true, messageID: id });
	};

	const handleDelete = async (id) => {
		if (!messageExists(id)) {
			return;
		}

		const messageObject = getMessage(id, state, app);
		const { message } = messageObject;

		if (message.includes('Warning Message')) {
			return;
		}

		updateMessage(id, {
			...messageObject,
			status: 'pending',
		});

		try {
			const messageDeleted = await deleteMessage({
				id,
				chatId: messageObject.room,
			});

	
			if (!messageDeleted) {
				updateMessage(id, messageObject);
				return;
			}

			removeMessage(id, messageObject.room);
		} catch (e) {
			console.log(e);
			updateMessage(id, messageObject);
		}
	};

	const renderIconButton = (props) => {
		return <BiDotsVerticalRounded {...props} className="fill-white scale-[1.8]" />;
	};

	const renderIconButtonReceiver = (props) => {
		return <BiDotsVerticalRounded {...props} className="fill-white scale-[1.8]" />;
	};

	if (isSender) {
		return (
			<Dropdown
				placement="leftStart"
				style={{
					zIndex: 'auto',
				}}
				renderToggle={renderIconButton}
				NoCaret
			>
				<Dropdown.Item onClick={() => handleEdit(id)}>Edit</Dropdown.Item>

				<Dropdown.Item onClick={() => handleCopyToClipBoard(id, state, app)}>Copy</Dropdown.Item>
				<Dropdown.Item onClick={() => setReplyId(id)}>Reply</Dropdown.Item>
				<Dropdown.Item onClick={() => handleDelete(id)}>Delete</Dropdown.Item>
			</Dropdown>
		);
	} else if (!isSender) {
		return (
			<Dropdown
				placement="rightStart"
				style={{
					zIndex: 'auto',
				}}
				renderToggle={renderIconButtonReceiver}
				NoCaret
			>
				<Dropdown.Item onClick={() => handleCopyToClipBoard(id, state, app)}>Copy</Dropdown.Item>
				<Dropdown.Item onClick={() => setReplyId(id)}>Reply</Dropdown.Item>
			</Dropdown>
		);
	} else {
		return null;
	}
};

export default DropDownOptions;

DropDownOptions.propTypes = {
	id: PropTypes.string.isRequired,
	inputRef: PropTypes.object.isRequired,
	isSender: PropTypes.bool.isRequired,
	cancelEdit: PropTypes.func.isRequired,
	setEditing: PropTypes.func.isRequired,
	setReplyId: PropTypes.func.isRequired,
};
