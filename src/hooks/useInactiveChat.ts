import { useEffect, useState } from 'react';

import { createBrowserNotification } from '@/lib/browserNotification';
import useCheckTimePassed from './useCheckTimePassed';
import { isGreaterThan3Minutes } from '@/lib/chatHelper';
import { MessageType } from '@/types/types';

const inactiveTimeThreshold = 180000;

export default (
  getLastMessage: MessageType | undefined,
  amITheSender: boolean | undefined
) => {
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const { timePassed, clearTimer } = useCheckTimePassed(
    lastMessageTime,
    inactiveTimeThreshold
  );

  useEffect(() => {
    if (
      amITheSender === null ||
      amITheSender === undefined ||
      !getLastMessage
    ) {
      return;
    }

    // get the time of the last message
    const newMessageTime = getLastMessage.time;

    // if the lastMessageTime stored in state is the same as
    // the newmessagetime then we return
    // if the newMessageTime is greater than 3 minutes we also return
    // this is so that the hook doesn't always run on render
    if (
      newMessageTime === lastMessageTime ||
      isGreaterThan3Minutes(inactiveTimeThreshold, newMessageTime)
    ) {
      return;
    }

    setLastMessageTime(newMessageTime);
  }, [getLastMessage, amITheSender]);

  useEffect(() => {
    if (timePassed) {
      if (amITheSender) {
        createBrowserNotification(
          'Inactive Chat',
          `Your Partner isn't responding, want to leave?`
        );
      } else if (!amITheSender) {
        createBrowserNotification(
          'Inactive Chat',
          `You haven't replied your partner yet`
        );
      } else {
        return;
      }

      clearTimer();
      setLastMessageTime(0);
    }
  }, [timePassed, amITheSender]);
};
