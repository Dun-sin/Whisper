import { AppType, RoomType, MessageType } from '@/types/types';
import { RefObject } from 'react';

export default (state: RoomType, app: AppType) => {
  const getMessage = (id: string): MessageType | null => {
    if (app.currentroom === null) {
      return null;
    }

    const chatContent = state[app.currentroom];

    if (!chatContent) {
      return null;
    }

    return chatContent.messages[id];
  };

  const messageExists = (id: string) => {
    return Boolean(getMessage(id));
  };

  const handleResend = (id: string, doSend: any) => {
    if (!messageExists(id)) {
      return;
    }

    const gottenMessage = getMessage(id);

    if (!gottenMessage) {
      return;
    }

    const { senderId, room, message, time } = gottenMessage;

    doSend({
      senderId,
      room,
      message,
      time,
      tmpId: id,
    });
  };

  const handleCopyToClipBoard = async (id: string) => {
    const gottenMessage = getMessage(id);

    if (!gottenMessage) {
      return;
    }

    const { message, containsBadword } = gottenMessage;

    if (containsBadword) {
      return;
    }

    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(message);
    } else {
      return document.execCommand('copy', true, message);
    }
  };

  function scrollToMessage(messageId: string, animate = true) {
    const element = document.getElementById(`message-${messageId}`);

    if (!element) {
      return;
    }

    const alreadyHighlighted = element.classList.contains('bg-[#FF9F1C]/25');

    element.scrollIntoView({
      behavior: 'auto',
    });

    if (!animate) {
      return;
    }

    if (alreadyHighlighted) {
      element.classList.replace('bg-[#FF9F1C]/25', 'bg-[#FF9F1C]/50');
    } else {
      element.classList.add('bg-[#FF9F1C]/50');
    }

    element.addEventListener(
      'transitionend',
      () => {
        if (alreadyHighlighted) {
          element.classList.replace('bg-[#FF9F1C]/50', 'bg-[#FF9F1C]/25');
        } else {
          element.classList.remove('bg-[#FF9F1C]/50');
        }
      },
      {
        once: true,
      }
    );
  }

  return {
    getMessage,
    messageExists,
    handleCopyToClipBoard,
    handleResend,
    scrollToMessage,
  };
};

export const adjustTextareaHeight = (
  inputRef: RefObject<HTMLTextAreaElement>
) => {
  if (inputRef.current) {
    const minTextareaHeight = '45px';
    const currentScrollHeight = inputRef.current.scrollHeight + 'px';

    inputRef.current.style.height =
      Math.max(parseInt(minTextareaHeight), parseInt(currentScrollHeight)) +
      'px';
  }
};

export const getTime = (time: number) => {
  return new Date(time).toLocaleTimeString();
};

export const isGreaterThan3Minutes = (interval: number, time: number) => {
  const currentTime = Date.now();
  const timeDifference = currentTime - time;

  if (timeDifference > interval) {
    return true;
  }
  return false;
};
