import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Store
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import events from '@/shared/constants/constants';

// Components
import NavBar from './NavBar';

import useIsTabActive from '@/hooks/useIsTabActive';
import { ProviderType } from '@/types/propstypes';
import { useSocket } from '@/context/SocketContext';

const PageWrapper = ({ children }: ProviderType) => {
  const { isLoggedIn } = useAuth();
  const { updateOnlineStatus, endSearch, app } = useApp();
  const { createChat } = useChat()
  const router = useRouter();
  const { settings } = app;

  const [onlineStatus, setOnlineStatus] = useState<Date | string | null>(null);

  const isTabActive = useIsTabActive();

  const { socket } = useSocket();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (isTabActive) {
      setOnlineStatus('online');
    } else {
      setOnlineStatus(new Date());
    }
  }, [isTabActive, isLoggedIn]);

  useEffect(() => {
    updateOnlineStatus(onlineStatus);
  }, [onlineStatus]);

  useEffect(() => {
    !isLoggedIn && router.push('/login');
  }, [isLoggedIn, router]);

  useEffect(() => {
    const onRestoreChat = ({ chats, currentChatId }: any) => {
      Object.values(chats).forEach((chat: any) => {
        createChat(chat.id, chat.userIds, chat.messages, chat.createdAt);
      });
      endSearch(currentChatId);
    };

    socket?.on(events.NEW_EVENT_CHAT_RESTORE, onRestoreChat);
    return () => {
      socket?.off(events.NEW_EVENT_CHAT_RESTORE, onRestoreChat);
    };
  }, [socket]);

  return (
    <section
      className={`flex flex-col-reverse md:flex-row h-screen ${
        settings.theme && 'dark'
      }`}
    >
      <NavBar />
      {children}
    </section>
  );
};

export default PageWrapper;
