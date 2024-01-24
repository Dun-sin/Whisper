import React, { useEffect, useContext, useMemo } from 'react';

import useIsTabActive from '@/hooks/useIsTabActive';

import useChatUtils from '@/lib/chatSocket';
import { useApp } from '@/context/AppContext';
import { useChat } from '@/context/ChatContext';
import { useSocket } from '@/context/SocketContext';
import { MessageSeenProps } from '@/types/propstypes';

const MessageSeen = ({ isRead, isSender }: MessageSeenProps) => {
  const { app } = useApp();

  const isTabVisible = useIsTabActive();

  const { messages: state, receiveMessage } = useChat();
  const { socket } = useSocket();
  const { seenMessage } = useChatUtils(socket);

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

  useEffect(() => {
    // Initialize Intersection Observer
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isSender) {
            // Mark the message as read
            const messageId = entry.target
              ?.getAttribute('id')
              ?.split('-')[1] as string;

            if (!app.currentRoomId) {
              return;
            }

            try {
              seenMessage({
                messageId,
                roomId: app.currentRoomId,
              });
            } catch (e) {
              return;
            }
            receiveMessage(messageId, app.currentRoomId);
          }
        });
      },
      { threshold: 0.5 }
      // Trigger when 50% of the element is in the viewport
    );

    if (!sortedMessages) {
      return;
    }

    sortedMessages.forEach(message => {
      if (message.isRead) {
        return;
      }

      const messageElement = document.getElementById(`message-${message.id}`);
      if (messageElement && isTabVisible) {
        observer.observe(messageElement);
      }
    });

    return () => {
      // Clean up the observer
      observer.disconnect();
    };
  }, [sortedMessages, isTabVisible, app.currentRoomId, isSender]);

  return isSender && <p className='text-sm'>{isRead ? 'Seen' : 'Not Seen'}</p>;
};

export default MessageSeen;
