import { BsArrow90DegLeft, BsArrow90DegRight } from 'react-icons/bs';
import React, { useState } from 'react'
import chatHelper, { getTime } from 'src/lib/chatHelper';

import BadWordsNext from 'bad-words-next';
import DropDownOptions from './DropDownOption';
import MarkdownIt from 'markdown-it';
import MessageSeen from './MessageSeen';
import MessageStatus from '../MessageStatus';
import PreviousMessages from './PreviousMessages';
import PropTypes from 'prop-types'
import en from 'bad-words-next/data/en.json';
import { useApp } from 'src/context/AppContext';
import { useChat } from 'src/context/ChatContext';

const MessageList = (
  {decryptedMessages,
  senderId,
  currentReplyMessageId,
  doSend,
  inputRef,
  cancelEdit,
  setEditing}
) => {
  const { app } = useApp();
  const { messasges: state, startReply } = useChat()
  const { handleResend, scrollToMessage } = chatHelper(state, app);

  // use the id so we can track what message's previousMessage is open
  const [openPreviousMessages, setOpenPreviousMessages] = useState(null);
  const [badwordChoices, setBadwordChoices] = useState({});

  const badwords = new BadWordsNext({ data: en });

  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });

  console.log({decryptedMessages})

  const openPreviousEdit = (messageId) => {
    if (openPreviousMessages === messageId) {
      setOpenPreviousMessages(null);
    } else {
      setOpenPreviousMessages(messageId);
    }
  };

  const hideBadword = (id) => {
    setBadwordChoices({ ...badwordChoices, [id]: 'hide' });
  };

  const showBadword = (id) => {
    setBadwordChoices({ ...badwordChoices, [id]: 'show' });
  };

  function getRepliedMessage(replyTo) {
    return decryptedMessages.find((object) => object.id === replyTo);
  }

  return (
    decryptedMessages &&
    decryptedMessages.map(
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
      }) => {
        const isSender = sender.toString() === senderId.toString();
        // original message this message is a reply to
        const repliedMessage = replyTo
          ? (() => {
            const messageObj = getRepliedMessage(replyTo);
            if (!messageObj) {
              return null;
            }

            return {
              ...messageObj,
            };
          })()
          : null;

        // is this message currently being replied?
        const hasActiveReply = currentReplyMessageId === id;
        const activeReplyClass = hasActiveReply ? 'bg-[#FF9F1C]/25 border-[#FF9F1C]' : '';
        const activeReplySenderClass = hasActiveReply
          ? isSender
            ? 'border-r-[3.5px]'
            : 'border-l-[3.5px]'
          : '';

        return (
          <div
            key={id}
            id={`message-${id}`}
            className={`
											flex flex-col gap-2 py-2 duration-500 transition-all 
											${activeReplyClass} ${activeReplySenderClass}`}
          >
            {replyTo && (
              <div
                className={`
										max-w-[80%] md:max-w-[50%] min-w-[10px] flex gap-2 items-center
											${sender.toString() === senderId.toString() ? 'self-end' : ''}
											${repliedMessage ? 'cursor-pointer' : ''}
										`}
                onClick={() => scrollToMessage(replyTo)}
              >
                <div className="truncate border-b-4 border-[#FF9F1C] p-1">
                  {repliedMessage ? (
                    typeof repliedMessage.message === 'string' ? (
                      <div
                        className="message-reply-container flex flex-nowrap items-center gap-2"
                        dangerouslySetInnerHTML={{
                          __html: md.render(repliedMessage.message),
                        }}
                      />
                    ) : (
                      repliedMessage.message
                    )
                  ) : (
                    <p className="text-gray-400 uppercase text-sm italic">
                      Original Message Deleted
                    </p>
                  )}
                </div>
                <div
                  className={sender.toString() !== senderId.toString() ? 'order-first' : ''}
                >
                  {sender.toString() === senderId.toString() ? (
                    <BsArrow90DegLeft className="fill-white text-2xl" />
                  ) : (
                    <BsArrow90DegRight className="fill-white text-2xl" />
                  )}
                </div>
              </div>
            )}
            <div
              className={`w-full flex text-white relative mb-2 ${isSender ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`flex flex-col mb-[2px] min-w-[10px] mdl:max-w-[80%] max-w-[50%] ${isSender ? 'items-end' : 'items-start'
                  }`}
              >
                {containsBadword && !isSender && !badwordChoices[id] ? (
                  <div className="dark:text-white text-black flex flex-col border-red border w-full rounded-r-md p-3">
                    <p>Your buddy is trying to send you a bad word</p>
                    <div className="flex w-full gap-6">
                      <span
                        onClick={() => showBadword(id)}
                        className="text-sm cursor-pointer"
                      >
                        See
                      </span>
                      <span
                        onClick={() => hideBadword(id)}
                        className="text-red text-sm cursor-pointer"
                      >
                        Hide
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`chat bg-red p-3 break-all will-change-auto flex gap-6 items-center text ${isSender
                        ? 'justify-between bg-secondary rounded-l-md'
                        : 'rounded-r-md'
                        }`}
                    >
                      {typeof message === 'string' ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: md.render(
                              badwordChoices[id] === 'hide'
                                ? badwords.filter(message)
                                : badwordChoices[id] === 'show'
                                  ? message
                                  : message
                            ),
                          }}
                        />
                      ) : badwordChoices[id] === 'hide' ? (
                        badwords.filter(message)
                      ) : badwordChoices[id] === 'show' ? (
                        message
                      ) : (
                        message
                      )}

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
                      className={`flex gap-2 items-center ${isSender ? 'flex-row' : 'flex-row-reverse'
                        }`}
                    >
                      <div
                        className={`text-[12px] ${status === 'failed' ? 'text-red-600' : 'text-white'
                          }`}
                      >
                        <MessageStatus
                          time={getTime(time)}
                          status={status ?? 'sent'}
                          iAmTheSender={isSender}
                          onResend={() => handleResend(id, doSend, state, app)}
                        />
                      </div>
                      <PreviousMessages
                        id={id}
                        isSender={isSender}
                        isEdited={isEdited}
                        openPreviousEdit={openPreviousEdit}
                        openPreviousMessages={openPreviousMessages}
                        oldMessages={oldMessages}
                      />
                    </div>
                    <MessageSeen isRead={isRead} isSender={isSender} />
                  </>
                )}
              </div>
            </div>
          </div>
        );
      }
    )
  )
}

export default MessageList

MessageList.propTypes = {
  decryptedMessages: PropTypes.array.isRequired,
  senderId: PropTypes.string.isRequired,
  currentReplyMessageId: PropTypes.string.isRequired,
  doSend: PropTypes.func.isRequired,
  inputRef: PropTypes.object.isRequired,
  cancelEdit: PropTypes.func.isRequired,
  setEditing: PropTypes.func.isRequired
}