import { BiDotsVerticalRounded } from 'react-icons/bi';
import Dropdown from 'rsuite/Dropdown';
import PropTypes from 'prop-types';
import React from 'react';
import chatHelper from 'src/lib/chatHelper';
import { socket } from 'src/lib/socketConnection';
import { useApp } from 'src/context/AppContext';
import { useChat } from 'src/context/ChatContext';
import useChatUtils from 'src/lib/chatSocket';
// import useCryptoKeys from 'src/hooks/useCryptoKeys';
import decryptMessage from 'src/lib/decryptMessage';

const DropDownOptions = ({
	id,
	isSender,
	inputRef,
	cancelEdit,
	setEditing,
	setReplyId,
	importedPrivateKey,
	cryptoKey,
	setMessage,
}) => {
	const { app } = useApp();

	const { messages: state, updateMessage, removeMessage } = useChat();
	const { getMessage, messageExists, handleCopyToClipBoard } = chatHelper(state, app);
	const { deleteMessage } = useChatUtils(socket);

	const handleEdit = async (id) => {
		setReplyId(id);
		inputRef.current.focus();
		const { message } = getMessage(id, state, app);

		const decryptedMessage = await decryptMessage(message, importedPrivateKey);

		if (message.includes('Warning Message')) {
			cancelEdit();
		} else {
			setMessage(decryptedMessage);
			// eslint-disable-next-line require-atomic-updates
			inputRef.current.value = decryptedMessage;
			setEditing({ isediting: true, messageID: id });
		}
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

	const handleReply = (id) => {
		// need to check if editing , only then call it to clear input
		cancelEdit();
		setReplyId(id);
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

				<Dropdown.Item onClick={() => handleCopyToClipBoard(id, importedPrivateKey)}>
					Copy
				</Dropdown.Item>
				<Dropdown.Item onClick={() => handleReply(id)}>Reply</Dropdown.Item>
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
				<Dropdown.Item onClick={() => handleCopyToClipBoard(id, cryptoKey)}>
					Copy
				</Dropdown.Item>
				<Dropdown.Item onClick={() => handleReply(id)}>Reply</Dropdown.Item>
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
	importedPrivateKey: PropTypes.object.isRequired,
	cryptoKey: PropTypes.object.isRequired,
	setMessage: PropTypes.func.isRequired,
};
