/* eslint-disable max-len */
import {
  useEffect,
  useRef,
  useContext,
  useMemo,
  useState,
  FormEvent,
} from 'react';
import { useSocket } from '@/context/SocketContext';

import ScrollToBottom from 'react-scroll-to-bottom';

import { Icon } from '@iconify/react';
import { v4 as uuid } from 'uuid';
import { throttle } from 'lodash';
import MarkdownIt from 'markdown-it';

import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

import useChatUtils from '@/lib/chatSocket';
import MessageStatus from '@/components/Chat/MessageStatus';
import { useNotification } from '@/lib/notification';
import events from '@/shared/constants/constants';
import { createBrowserNotification } from '@/lib/browserNotification';

import chatHelper, { adjustTextareaHeight, getTime } from '../lib/chatHelper';

import MessageSeen from './Chat/MessageSeen';
import MessageInput from './Chat/MessageInput';
import DropDownOptions from './Chat/DropDownOption';
import PreviousMessages from './Chat/PreviousMessages';
import decryptMessage from '@/lib/decryptMessage';
import useInactiveChat from '@/hooks/useInactiveChat';
import { MessageType, InputRefType } from '@/types/types';
import BadwordHideShow from './Chat/BadwordHideShow';

let senderId: string | undefined;

const Chat = () => {
  const { app } = useApp();
  const notification = useNotification({ settings: app.settings });
  const [editing, setEditing] = useState<{
    isediting: boolean;
    messageID: string;
  }>({
    isediting: false,
    messageID: '',
  });
  const [message, setMessage] = useState<string>('');
  // use the id so we can track what message's previousMessage is open
  const [openPreviousMessages, setOpenPreviousMessages] = useState<string>('');
  const [badwordChoices, setBadwordChoices] = useState<{
    [id: string]: string;
  }>({});

  const {
    messages: state,
    addMessage,
    updateMessage,
    removeMessage,
    receiveMessage,
    startReply,
    currentReplyMessageId,
    cancelReply,
  } = useChat();
  const { authState, dispatchAuth } = useAuth();
  const { socket } = useSocket();

  const { sendMessage, editMessage } = useChatUtils(socket);
  const { getMessage, handleResend, scrollToMessage } = chatHelper(state, app);

  const inputRef: InputRefType = useRef<HTMLTextAreaElement | null>(null);

  senderId = authState.loginId;

  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });

  const getBadwords = async () => {
    const BadWordsNext = (await import('bad-words-next')).default;
    const en = (await import('bad-words-next/data/en.json')).default;
    return new BadWordsNext({ data: en });
  }

  function logOut() {
    dispatchAuth({
      type: 'LOGOUT',
    });
  }

  const cancelEdit = () => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.value = '';
    setEditing({ isediting: false, messageID: '' });
    socket?.timeout(10000).emit(events.NEW_EVENT_TYPING, {
      roomId: app.currentRoomId,
      isTyping: false,
    });
  };

  const sortedMessages = useMemo(() => {
    if (!app.currentRoomId) {
      return;
    }
    return Object.values(state[app.currentRoomId]?.messages ?? {})?.sort(
      (a, b) => {
        const da = new Date(a.time),
          db = new Date(b.time);
        return da.getTime() - db.getTime();
      }
    );
  }, [state, app.currentRoomId]);

  const doSend = async ({
    senderId,
    roomId,
    message,
    time,
    containsBadword,
    replyTo = null,
  }: {
    senderId: string;
    roomId: string | null;
    message: string;
    time: number;
    containsBadword: boolean;
    replyTo: string | null;
  }) => {
    try {
      const sentMessage = await sendMessage({
        senderId,
        message,
        time,
        roomId,
        containsBadword,
        replyTo,
      });

      const toAddMessage: MessageType = { ...sentMessage, status: 'pending' };
      addMessage(toAddMessage);

      // try {
      //   updateMessage(sentMessage);
      // } catch {
      //   logOut();
      //   return false;
      // }
    } catch (e) {
      try {
        updateMessage({
          senderId,
          roomId,
          id: uuid(),
          message,
          time,
          status: 'failed',
          containsBadword,
          replyTo,
        });
      } catch {
        logOut();
      }
      console.log(e);
      return false;
    }

    return true;
  };

  // Here whenever user will submit message it will be send to the server
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const badwords = await getBadwords();
    e.preventDefault();

    socket?.emit(events.NEW_EVENT_TYPING, {
      roomId: app.currentRoomId,
      isTyping: false,
    });
    const d = new Date();
    const message = inputRef.current?.value.trim(); // Trim the message to remove the extra spaces

    if (message === '' || senderId === undefined || senderId === '123456') {
      return;
    }

    if (editing.isediting === true) {
      try {
        const messageObject = getMessage(editing.messageID);
        const oldMessage = messageObject?.message;
        const editedMessage = await editMessage({
          id: editing.messageID,
          roomId: app.currentRoomId,
          newMessage: message as string,
          oldMessage,
        });

        updateMessage({
          ...editedMessage,
          roomId: app.currentRoomId,
          isEdited: true,
        });
      } catch (e) {
        setEditing({ isediting: false, messageID: '' });
        return;
      }
      setEditing({ isediting: false, messageID: '' });
    } else {
      doSend({
        senderId,
        roomId: app.currentRoomId,
        message: message as string,
        time: d.getTime(),
        containsBadword: badwords.check(message as string),
        replyTo: currentReplyMessageId,
      });
    }

    if (inputRef.current) {
      inputRef.current.value = '';
      setMessage('');
      inputRef.current.focus();
    }
    cancelReply();
  };

  const handleTypingStatus = throttle(e => {
    if (e.target.value.length > 0) {
      socket?.timeout(5000).emit(events.NEW_EVENT_TYPING, {
        roomId: app.currentRoomId,
        isTyping: true,
      });
    }
    setMessage(e.target.value);
    adjustTextareaHeight(inputRef);
    e.target.style.height = '48px';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, 500);

  const openPreviousEdit = (messageId: string) => {
    if (openPreviousMessages === messageId) {
      setOpenPreviousMessages('');
    } else {
      setOpenPreviousMessages(messageId);
    }
  };

  const hideBadword = (id: string) => {
    setBadwordChoices({ ...badwordChoices, [id]: 'hide' });
  };

  const showBadword = (id: string) => {
    setBadwordChoices({ ...badwordChoices, [id]: 'show' });
  };

  // Clear chat when escape is pressed
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editing.isediting) {
        event.preventDefault();
        cancelEdit();
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [editing]);

  useEffect(() => {
    const newMessageHandler = async (message: MessageType) => {
      try {
        addMessage(message);
        await notification?.playNotification('newMessage');
        createBrowserNotification(
          'You received a new message on Whisper',
          message.message
        );
      } catch {
        logOut();
      }
    };

    const deleteMessageHandler = ({
      id,
      roomId,
    }: {
      id: string;
      roomId: string;
    }) => {
      removeMessage(id, roomId);
    };

    const editMessageHandler = (messageEdited: MessageType) => {
      updateMessage({
        ...messageEdited,
        roomId: app.currentRoomId,
        isEdited: true,
      });
    };

    const limitMessageHandler = (data: { message: string }) => {
      alert(data.message);
    };

    const readMessageHandler = ({
      messageId,
      roomId,
    }: {
      messageId: string;
      roomId: string;
    }) => {
      receiveMessage(messageId, roomId);
    };

    // This is used to recive message form other user.
    socket?.on(events.NEW_EVENT_RECEIVE_MESSAGE, newMessageHandler);
    socket?.on(events.NEW_EVENT_DELETE_MESSAGE, deleteMessageHandler);
    socket?.on(events.NEW_EVENT_EDIT_MESSAGE, editMessageHandler);
    socket?.on(events.NEW_EVENT_READ_MESSAGE, readMessageHandler);
    socket?.on(events.NEW_EVENT_SEND_FAILED, limitMessageHandler);

    return () => {
      socket?.off(events.NEW_EVENT_RECEIVE_MESSAGE, newMessageHandler);
      socket?.off(events.NEW_EVENT_DELETE_MESSAGE, deleteMessageHandler);
      socket?.off(events.NEW_EVENT_EDIT_MESSAGE, editMessageHandler);
      socket?.off(events.NEW_EVENT_READ_MESSAGE, readMessageHandler);
      socket?.off(events.NEW_EVENT_SEND_FAILED, limitMessageHandler);
    };
  }, [app.currentRoomId, socket]);

  // this is used to send the notification for inactive chat to the respective user
  // get the last message sent
  const getLastMessage = sortedMessages?.at(-1);

  const amITheSender = getLastMessage && getLastMessage.senderId === senderId;

  // pass it to the hook
  useInactiveChat(getLastMessage, amITheSender);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.focus();
  }, [currentReplyMessageId]);

  return (
    <div className='w-full md:h-[90%] min-h-[100%] pb-[25px] flex flex-col justify-between gap-6'>
      <div className='max-h-[67vh]'>
        <p className='text-[0.8em] font-semibold mb-[10px] mt-[20px] text-center'>
          Connected with a random User
          {sortedMessages?.length === 0 && ', Be the first to send {"Hello"}'}
        </p>
        <ScrollToBottom
          initialScrollBehavior='auto'
          className='h-[100%] md:max-h-full overflow-y-auto w-full scroll-smooth'
        >
          {sortedMessages?.map(
            ({
              senderId: sender,
              id,
              message,
              time,
              status,
              isEdited,
              oldMessages,
              containsBadword,
              isRead,
              replyTo,
            }: MessageType) => {
              const isSender = sender.toString() === senderId?.toString();
              message = decryptMessage(message) as string;
              // original message this message is a reply to
              const repliedMessage = replyTo
                ? (() => {
                    const messageObj = getMessage(replyTo);
                    if (!messageObj) {
                      return null;
                    }

                    return {
                      ...messageObj,
                      message: decryptMessage(messageObj.message),
                    };
                  })()
                : null;

              // is this message currently being replied?
              const hasActiveReply = currentReplyMessageId === id;
              id = id as string;
              return (
                <div
                  key={id}
                  id={`message-${id}`}
                  className={`
								flex flex-col gap-2 py-2 duration-500 transition-all
									${hasActiveReply ? 'bg-[#FF9F1C]/25 border-[#FF9F1C]' : ''},
									${hasActiveReply ? (isSender ? 'border-r-[3.5px]' : 'border-l-[3.5px]') : ''}`}
                >
                  {replyTo && (
                    <div
                      className={`
										max-w-[80%] md:max-w-[50%] min-w-[10px] flex gap-2 items-center
											${sender.toString() === senderId?.toString() ? 'self-end' : ''}
											${repliedMessage ? 'cursor-pointer' : ''}
										`}
                      onClick={() => scrollToMessage(replyTo)}
                    >
                      <div className='truncate border-b-4 border-[#FF9F1C] p-1'>
                        {repliedMessage ? (
                          typeof repliedMessage.message === 'string' ? (
                            <div
                              className='message-reply-container flex flex-nowrap items-center gap-2'
                              dangerouslySetInnerHTML={{
                                __html: md.render(repliedMessage.message),
                              }}
                            />
                          ) : (
                            repliedMessage.message
                          )
                        ) : (
                          <p className='text-gray-400 uppercase text-sm italic'>
                            Original Message Deleted
                          </p>
                        )}
                      </div>
                      <div
                        className={
                          sender.toString() !== senderId?.toString()
                            ? 'order-first'
                            : ''
                        }
                      >
                        {sender.toString() === senderId?.toString() ? (
                          <Icon
                            icon='bi:arrow-90deg-left'
                            className='fill-white h-6 w-6'
                          />
                        ) : (
                          <Icon
                            icon='bi:arrow-90deg-left'
                            className='text-white h-6 w-6'
                          />
                        )}
                      </div>
                    </div>
                  )}
                  <div
                    className={`w-full flex text-white relative mb-2 ${
                      isSender ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex flex-col mb-[2px] min-w-[10px] mdl:max-w-[80%] max-w-[50%] ${
                        isSender ? 'items-end' : 'items-start'
                      }`}
                    >
                      {containsBadword && !isSender && !badwordChoices[id] ? (
                        <div className='flex flex-col border-red border w-full rounded-r-md p-3'>
                          <p>Your buddy is trying to send you a bad word</p>
                          <div className='flex w-full gap-6'>
                            <span
                              onClick={() => showBadword(id as string)}
                              className='text-sm cursor-pointer'
                            >
                              See
                            </span>
                            <span
                              onClick={() => hideBadword(id as string)}
                              className='text-red text-sm cursor-pointer'
                            >
                              Hide
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className={`chat bg-red p-3 break-all will-change-auto flex gap-6 items-center text ${
                              isSender
                                ? 'justify-between bg-secondary rounded-l-md'
                                : 'rounded-r-md'
                            }`}
                          >
                            <BadwordHideShow message={message} md={md} badwordChoices={badwordChoices} id={id} />

                            <DropDownOptions
                              isSender={isSender && status !== 'pending'}
                              id={id}
                              inputRef={inputRef}
                              cancelEdit={cancelEdit}
                              setEditing={setEditing}
                              setReplyId={startReply}
                            />
                          </div>
                          <div
                            className={`flex gap-2 items-center ${
                              isSender ? 'flex-row' : 'flex-row-reverse'
                            }`}
                          >
                            <div
                              className={`text-[12px] ${
                                status === 'failed'
                                  ? 'text-red-600'
                                  : 'text-white'
                              }`}
                            >
                              <MessageStatus
                                time={getTime(time)}
                                status={status ?? 'sent'}
                                iAmTheSender={isSender}
                                onResend={() =>
                                  handleResend(id as string, doSend)
                                }
                              />
                            </div>
                            <PreviousMessages
                              id={id}
                              isSender={isSender}
                              isEdited={isEdited}
                              openPreviousEdit={openPreviousEdit}
                              openPreviousMessages={openPreviousMessages}
                              oldMessages={oldMessages as string[]}
                            />
                          </div>
                          <MessageSeen
                            isRead={isRead as boolean}
                            isSender={isSender}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </ScrollToBottom>
      </div>

      <MessageInput
        message={message}
        handleTypingStatus={handleTypingStatus}
        setMessage={setMessage}
        editing={editing}
        cancelEdit={cancelEdit}
        handleSubmit={handleSubmit}
        inputRef={inputRef}
      />
    </div>
  );
};

export default Chat;
