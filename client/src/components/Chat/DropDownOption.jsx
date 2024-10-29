import { BiDotsVerticalRounded } from 'react-icons/bi';
import Dropdown from 'rsuite/Dropdown';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import chatHelper from 'src/lib/chatHelper';
import { socket } from 'src/lib/socketConnection';
import { useApp } from 'src/context/AppContext';
import { useChat } from 'src/context/ChatContext';
import useChatUtils from 'src/lib/chatSocket';
import useCryptoKeys from 'src/hooks/useCryptoKeys';

import { FIFTEEN_MINUTES } from '../../../../constants.json';

const DropDownOptions = ({ id, isSender, inputRef, cancelEdit, setEditing, setReplyId }) => {
	const { app } = useApp();

	const { importedPrivateKey, cryptoKey } = useCryptoKeys(app.currentChatId);
	const { messages: state, updateMessage, removeMessage } = useChat();
	const { getMessage, messageExists, handleCopyToClipBoard } = chatHelper(state, app);
	const { deleteMessage } = useChatUtils(socket);

	const message = getMessage(id, state, app);

	const isWithin15Minutes = useMemo(() => {
		return Date.now() - new Date(message.time).getTime() <= FIFTEEN_MINUTES;
	}, [message.time]);

	const handleEdit = (id) => {
		if (!isWithin15Minutes) {
			return;
		}

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
		if (!messageExists(id) || !isWithin15Minutes) {
			return;
		}

		const messageObject = getMessage(id, state, app);
		const { message } = messageObject;

		if (message.includes('Warning Message')) {
			return;
		}

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
				{isWithin15Minutes && <Dropdown.Item onClick={() => handleEdit(id)}>Edit</Dropdown.Item>}

				<Dropdown.Item onClick={() => handleCopyToClipBoard(id, importedPrivateKey)}>
					Copy
				</Dropdown.Item>
				<Dropdown.Item onClick={() => setReplyId(id)}>Reply</Dropdown.Item>

				{isWithin15Minutes && (
					<Dropdown.Item onClick={() => handleDelete(id)}>Delete</Dropdown.Item>
				)}
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
				<Dropdown.Item onClick={() => handleCopyToClipBoard(id, cryptoKey)}>Copy</Dropdown.Item>
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
