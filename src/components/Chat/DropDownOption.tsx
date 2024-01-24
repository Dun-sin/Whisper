import React, { useContext } from 'react';

import Dropdown from 'rsuite/Dropdown';
import { Icon } from '@iconify/react';

import chatHelper from '@/lib/chatHelper';

import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import { useSocket } from '@/context/SocketContext';

import useChatUtils from '@/lib/chatSocket';
import { DropDownProps } from '@/types/propstypes';

const DropDownOptions = ({
  id,
  isSender,
  inputRef,
  cancelEdit,
  setEditing,
  setReplyId,
}: DropDownProps) => {
  const { app } = useApp();
  const { socket } = useSocket();

  const { messages: state, updateMessage, removeMessage } = useChat();
  const { getMessage, messageExists, handleCopyToClipBoard } = chatHelper(
    state,
    app
  );
  const { deleteMessage } = useChatUtils(socket);

  const handleEdit = (id: string) => {
    inputRef?.current?.focus();
    const gottenMessage = getMessage(id);

    if (!gottenMessage) {
      return;
    }

    const { message } = gottenMessage;

    if (gottenMessage.containsBadword) {
      cancelEdit();
      return;
    }

    if (!inputRef.current) {
      return;
    }
    inputRef.current.value = message;

    setEditing({ isediting: true, messageID: id });
  };

  const handleDelete = async (id: string) => {
    if (!messageExists(id)) {
      return;
    }

    const gottenMessage = getMessage(id);

    if (!gottenMessage) {
      return;
    }

    if (gottenMessage.containsBadword) {
      return;
    }

    const messageToUpdate = { ...gottenMessage };

    messageToUpdate.status = 'pending';

    updateMessage(messageToUpdate);

    try {
      const messageDeleted = await deleteMessage({
        id,
        room: gottenMessage.room as string,
      });

      console.log(messageDeleted);
      if (!messageDeleted) {
        updateMessage(id);
        return;
      }

      removeMessage(id, gottenMessage.room as string);
    } catch (e) {
      console.log(e);
      updateMessage(gottenMessage);
    }
  };

  const renderIconButton = (props: any) => {
    return (
      <Icon
        icon='mdi:dots-vertical'
        {...props}
        className='fill-white h-7 w-7'
      />
    );
  };

  const renderIconButtonReceiver = (props: any) => {
    return (
      <Icon
        icon='mdi:dots-vertical'
        {...props}
        className='fill-white h-7 w-7'
      />
    );
  };

  if (isSender) {
    return (
      <Dropdown
        placement='leftStart'
        style={{
          zIndex: 'auto',
        }}
        renderToggle={renderIconButton}
        NoCaret
      >
        <Dropdown.Item onClick={() => handleEdit(id)}>Edit</Dropdown.Item>

        <Dropdown.Item onClick={() => handleCopyToClipBoard(id)}>
          Copy
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setReplyId(id)}>Reply</Dropdown.Item>
        <Dropdown.Item onClick={() => handleDelete(id)}>Delete</Dropdown.Item>
      </Dropdown>
    );
  } else if (!isSender) {
    return (
      <Dropdown
        placement='rightStart'
        style={{
          zIndex: 'auto',
        }}
        renderToggle={renderIconButtonReceiver}
        NoCaret
      >
        <Dropdown.Item onClick={() => handleCopyToClipBoard(id)}>
          Copy
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setReplyId(id)}>Reply</Dropdown.Item>
      </Dropdown>
    );
  } else {
    return null;
  }
};

export default DropDownOptions;
