import React, { useState, useEffect, useContext } from 'react';

import { Icon } from '@iconify/react';

import EmojiPicker from './EmojiPicker';
import useKeyPress, { ShortcutFlags } from '@/hooks/useKeyPress';
import events from '@/shared/constants/constants';

import { useSocket } from '@/context/SocketContext';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import chatHelper from '@/lib/chatHelper';
import { useApp } from '@/context/AppContext';
import { MessageInputProps } from '@/types/propstypes';

const MessageInput = ({
  inputRef,
  message,
  handleTypingStatus,
  setMessage,
  editing,
  cancelEdit,
  handleSubmit,
}: MessageInputProps) => {
  const [isTextAreaDisabled, setTextAreaDisabled] = useState(false);
  const {
    currentReplyMessage,
    currentReplyMessageId,
    cancelReply,
    messages: state,
  } = useChat();
  const { authState } = useAuth();

  const { app } = useApp();

  const { scrollToMessage } = chatHelper(state, app);

  const senderId = authState.loginId;

  const { socket } = useSocket();

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

  // Create a function to handle "Ctrl + Enter" key press
  const handleCtrlEnter = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Use the useKeyPress hook to listen for "Ctrl + Enter" key press
  useKeyPress(['Enter'], handleCtrlEnter, ShortcutFlags.ctrl);

  useEffect(() => {
    socket?.on(events.NEW_EVENT_SEND_FAILED, limitMessageHandler);

    return () => {
      socket?.off(events.NEW_EVENT_SEND_FAILED, limitMessageHandler);
    };
  }, [socket]);

  return (
    <>
      <form
        className='flex flex-col justify-center items-center mt-[40px]'
        onSubmit={handleSubmit}
      >
        {currentReplyMessage && (
          <div className='w-full p-2 flex items-center justify-between gap-2 border rounded-t-md'>
            <div className='flex items-center gap-2'>
              <Icon
                icon='solar:arrow-right-bold'
                className='fill-white scale-150'
              />
              {typeof currentReplyMessage.message !== 'string' ? (
                <div className='truncate'>{currentReplyMessage.message}</div>
              ) : (
                <div
                  className='truncate cursor-pointer'
                  onClick={() => scrollToMessage(currentReplyMessageId)}
                >
                  {currentReplyMessage.senderId.toString() ===
                  senderId.toString()
                    ? 'Replying Yourself'
                    : 'Replying to Buddy'}
                </div>
              )}
            </div>
            <Icon
              icon='solar:close-circle-broken'
              onClick={() => cancelReply()}
              className='fill-white scale-150 cursor-pointer'
            />
          </div>
        )}
        <div className='w-full flex justify-center items-center'>
          <div
            className={`w-full flex items-center justify-between bg-secondary ${
              currentReplyMessage ? 'rounded-bl-md' : 'rounded-l-md'
            } max-h-[150px] relative`}
          >
            <textarea
              placeholder='Press Ctrl + Enter to send a message'
              className='h-[48px] focus:outline-none w-[96%] bg-secondary text-white rounded-[15px] resize-none pl-[22px] pr-[22px] py-[10px] text-[18px] placeholder-shown:align-middle min-h-[40px] max-h-[100px] overflow-y-auto'
              ref={inputRef}
              value={message}
              onChange={handleTypingStatus}
              disabled={isTextAreaDisabled} // Disable textarea based on the state
            />
            <EmojiPicker
              onEmojiPick={setMessage}
              focusInput={() => inputRef?.current?.focus()}
            />
            {editing.isediting && (
              <Icon
                icon='solar:close-circle-broken'
                onClick={cancelEdit}
                className='fill-white mr-5 scale-[1.3] cursor-pointer'
              />
            )}
          </div>
          <button
            type='submit'
            className={`bg-[#FF9F1C] h-[47px] w-[70px] flex justify-center items-center ${
              currentReplyMessage ? 'rounded-br-md' : 'rounded-r-md'
            }`}
          >
            <Icon
              icon='iconamoon:send-fill'
              className='fill-primary scale-[2]'
            />
          </button>
        </div>
      </form>
    </>
  );
};

export default MessageInput;
