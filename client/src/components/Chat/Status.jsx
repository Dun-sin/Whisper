import React, { useState } from 'react'
import chatHelper, { getTime } from 'src/lib/chatHelper'

import MessageStatus from '../MessageStatus'
import PreviousMessages from './PreviousMessages'
import PropTypes from 'prop-types'
import { useApp } from 'src/context/AppContext'
import { useChat } from 'src/context/ChatContext'

const Status = ({
  id,
  isSender,
  doSend,
  time,
  isEdited,
  oldMessages,
}) => {
  const { app } = useApp();
  const { messasges: state } = useChat()
  const { handleResend } = chatHelper(state, app)
  const [openPreviousMessages, setOpenPreviousMessages] = useState(null);

  const openPreviousEdit = (messageId) => {
    if (openPreviousMessages === messageId) {
      setOpenPreviousMessages(null);
    } else {
      setOpenPreviousMessages(messageId);
    }
  };

  return (
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
  )
}

export default Status

Status.propTypes = {
  id: PropTypes.string.isRequired,
  isSender: PropTypes.bool.isRequired,
  doSend: PropTypes.func.isRequired,
  time: PropTypes.number.isRequired,
  isEdited: PropTypes.bool,
  oldMessages: PropTypes.object,
  status: PropTypes.string.isRequired
}