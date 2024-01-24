import {
  MutableRefObject,
  Ref,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import events from '@/shared/constants/constants';

import { Dropdown, IconButton, Tooltip, Whisper } from 'rsuite';
import { Icon } from '@iconify/react';

// Store
import { useSocket } from '@/context/SocketContext';
import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import { useDialog } from '@/context/DialogContext';

// Components
import Chat from '@/components/Chat';

// lib
import { isExplicitDisconnection } from '@/lib/utils';
import { useNotification } from '@/lib/notification';
import { createBrowserNotification } from '@/lib/browserNotification';

import useKeyPress, { ShortcutFlags } from '@/hooks/useKeyPress';
import useCheckTimePassed from '@/hooks/useCheckTimePassed';
import { RoomType, OnlineStatus } from '@/types/types';
import PageWrapper from '@/components/PageWrapper';

const centerItems = `flex items-center justify-center`;

const Anonymous = () => {
  const { app, endSearch, updateConnection } = useApp();
  const { currentRoomId, onlineStatus, disconnected } = app;
  const { clearTimer } = useCheckTimePassed(0, 0);
  const notification = useNotification({ settings: app.settings });
  const { createChat, closeAllChats } = useChat();

  const currentroomRef = useRef(currentRoomId);
  const reconnectAttempts = useRef(0);

  const [isTyping, setIsTyping] = useState(false);
  const [autoSearchAfterClose, setAutoSearchAfterClose] = useState(false);

  const [buddyOnlineStatus, setBuddyOnlineStatus] = useState<any>(null);

  const autoSearchRef = useRef(false);
  autoSearchRef.current = autoSearchAfterClose;

  const typingStatusTimeoutRef: MutableRefObject<null | ReturnType<
    typeof setTimeout
  >> = useRef(null);

  const navigate = useRouter();
  const { socket } = useSocket();
  const { closeChat } = useChat();
  const { setDialog } = useDialog();

  socket?.on(
    events.NEW_EVENT_DISPLAY,
    ({ isTyping, roomId }: { isTyping: boolean; roomId: string }) => {
      // eslint-disable-next-line curly
      if (roomId !== currentRoomId) return;
      if (!isTyping) {
        setIsTyping(false);
        return;
      }

      setIsTyping(true);

      if (typingStatusTimeoutRef.current) {
        clearTimeout(typingStatusTimeoutRef.current);
      }

      typingStatusTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  );

  const closeChatHandler = (autoSearch = false) => {
    const currentRoomId = currentroomRef.current;

    if (!currentRoomId) {
      navigate.push('/');
      return;
    }

    setAutoSearchAfterClose(autoSearch);

    socket
      ?.timeout(30000)
      .emit(
        events.NEW_EVENT_CLOSE,
        currentRoomId,
        (err: any, chatClosed: boolean) => {
          if (err) {
            alert('An error occured whiles closing chat.');
            setAutoSearchAfterClose(false);
            return err;
          }

          if (chatClosed) {
            closeChat(currentRoomId);
          }

          endSearch(null);

          if (chatClosed && autoSearchRef.current) {
            navigate.push('/searching');
            setAutoSearchAfterClose(false);
          } else {
            navigate.push('/');
          }

          clearTimer();
        }
      );
  };

  const MenuToggle = (props: any, ref: Ref<any>) => {
    return (
      <IconButton
        {...props}
        ref={ref}
        icon={<Icon icon='mdi:dots-vertical' />}
        appearance='subtle'
        circle
      />
    );
  };

  const handleClose = (autoSearch = false) => {
    setDialog({
      isOpen: true,
      text: 'Are you sure you want to close this chat?',
      handler: () => closeChatHandler(autoSearch),
    });
  };

  useKeyPress(
    ['x'],
    () => handleClose(),
    ShortcutFlags.ctrl | ShortcutFlags.shift
  );
  useKeyPress(
    ['n'],
    () => handleClose(true),
    ShortcutFlags.ctrl | ShortcutFlags.alt
  );

  useEffect(() => {
    const newMessageEvents = [
      events.NEW_EVENT_RECEIVE_MESSAGE,
      events.NEW_EVENT_DELETE_MESSAGE,
      events.NEW_EVENT_EDIT_MESSAGE,
    ];

    socket?.on(events.NEW_EVENT_CLOSE, async roomId => {
      endSearch(null);
      closeChat(roomId);
      await notification?.playNotification('chatClosed');

      if (
        !confirm(
          'This chat is closed! Would you like to search for a new buddy?'
        )
      ) {
        navigate.push('/');
        return;
      }

      createBrowserNotification('Chat Closed', 'Your buddy left the chat');
      navigate.push('/searching');
    });

    const connectionEvents = {
      connect: () => {
        updateConnection(false);
      },

      disconnect: (reason: string) => {
        updateConnection(!isExplicitDisconnection(reason));
      },
    };

    function onNewMessage() {
      setIsTyping(false);
    }

    const onlineStatushandler = (onlineStatusState: OnlineStatus) => {
      if (!onlineStatusState) {
        return;
      }

      if (typeof onlineStatusState === 'object') {
        const date = new Date(onlineStatusState);
        const today = new Date();
        // Set today's date to the beginning of the day
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1); // Set it to yesterday

        let formattedDate;
        if (date >= today) {
          // Today
          formattedDate = `Last seen today at ${date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}`;
        } else if (date >= yesterday) {
          // Yesterday
          formattedDate = `Last seen yesterday at ${date.toLocaleString(
            'en-US',
            { hour: '2-digit', minute: '2-digit' }
          )}`;
        } else {
          // More than yesterday
          formattedDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
        setBuddyOnlineStatus(formattedDate);
      } else if (typeof onlineStatusState === 'string') {
        setBuddyOnlineStatus(onlineStatusState);
      }
    };

    const keys = Object.keys(connectionEvents);

    for (const event in connectionEvents) {
      const value =
        connectionEvents[
          keys.find(k => k === event) as keyof typeof connectionEvents
        ];
      socket?.on(event, value);
    }

    newMessageEvents.forEach(event => {
      socket?.on(event, onNewMessage);
    });

    socket?.on(events.NEW_EVENT_INACTIVE, () => {
      closeAllChats();
    });

    socket?.on(events.NEW_EVENT_ONLINE_STATUS, onlineStatushandler);

    function disconnect() {
      reconnectAttempts.current = 0;
      if (app.currentRoomId) {
        return;
      }

      socket?.disconnect();
      updateConnection(true);
      endSearch(null);
    }

    function onDisconnect(reason: string) {
      if (isExplicitDisconnection(reason)) {
        return;
      }

      disconnect();
    }

    function onReconnectAttempt(attempts: number) {
      reconnectAttempts.current = attempts;
    }

    function onReconnectError() {
      if (reconnectAttempts.current >= 3) {
        disconnect();
      }
    }

    socket?.on('disconnect', onDisconnect);
    socket?.io.on('reconnect_attempt', onReconnectAttempt);
    socket?.io.on('reconnect_error', onReconnectError);

    return () => {
      socket?.off(events.NEW_EVENT_ONLINE_STATUS, onlineStatushandler);
      socket?.off('connect');
      socket?.off(events.NEW_EVENT_CLOSE);
      socket?.off(events.NEW_EVENT_INACTIVE);
      socket?.off('disconnect', onDisconnect);

      socket?.io.off('reconnect_attempt', onReconnectAttempt);
      socket?.io.off('reconnect_error', onReconnectError);

      newMessageEvents.forEach(event => {
        socket?.off(event, onNewMessage);
      });

      for (const event in connectionEvents) {
        const value =
          connectionEvents[
            keys.find(k => k === event) as keyof typeof connectionEvents
          ];
        socket?.off(event, value);
      }
    };
  }, [app.currentRoomId, navigate, socket]);

  useEffect(() => {
    if (!onlineStatus) {
      return;
    }

    socket?.timeout(5000).emit(events.NEW_EVENT_ONLINE_STATUS, {
      onlineStatus,
      roomId: currentRoomId,
    });
  }, [onlineStatus, currentRoomId, socket]);

  return (
    <PageWrapper>
      <div
        className={`
				${centerItems} bg-light dark:bg-primary md:min-w-[calc(100%-108px)] min-w-full flex-col h-full text-primary dark:text-white`}
      >
        {disconnected && (
          <div className='bg-red w-full text-center'>
            You&apos;ve lost your connection.
          </div>
        )}
        <div className='flex items-center justify-between border-b-[2px] px-5 border-secondary h-[10%] w-[100%]'>
          <div className='md:hidden'>
            <Whisper
              placement='auto'
              controlId='control-id-hover'
              trigger='hover'
              speaker={<Tooltip>Home</Tooltip>}
            >
              <IconButton
                onClick={() => navigate.push('/')}
                appearance='subtle'
                className='bg-primary '
                icon={<Icon icon='ion:arrow-back' />}
                circle
              />
            </Whisper>
          </div>
          <div className='flex flex-col gap-2 items-center sm:items-start'>
            <h2 className=' text-xl font-semibold'>Anonymous User</h2>
            <div className='flex items-center gap-3'>
              {isTyping && <span>Typing</span>}
              {buddyOnlineStatus && (
                <span className=' text-gray-400 text-sm'>
                  {buddyOnlineStatus}
                </span>
              )}
            </div>
          </div>

          <Dropdown
            placement='leftStart'
            style={{ zIndex: 3 }}
            renderToggle={MenuToggle}
            noCaret
          >
            <Dropdown.Item
              onClick={() => handleClose()}
              className='sm:w-[200px]'
            >
              <div className='flex items-center justify-between gap-2 flex-wrap'>
                <span>Close Chat</span>
                <span className='text-gray-500 text-xs'>Ctrl + Shift + X</span>
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => handleClose(true)}
              className='sm:w-[200px]'
            >
              <div className='flex items-center justify-between gap-2 flex-wrap'>
                <span>Find a new buddy</span>
                <span className='text-gray-500 text-xs'>Ctrl + Alt + N</span>
              </div>
            </Dropdown.Item>
          </Dropdown>
        </div>
        <div
          className={`
					${centerItems} flex-col w-[90%] h-full flex-auto`}
        >
          <Chat />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Anonymous;
