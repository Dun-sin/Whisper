import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { ThreeDots } from 'react-loading-icons';
import { Icon } from '@iconify/react';

import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useChat } from '@/context/ChatContext';

import events from '@/shared/constants/constants';

import { useNotification } from '@/lib/notification';
import { createBrowserNotification } from '@/lib/browserNotification';

import PageWrapper from '@/components/PageWrapper';

const defaultLoadingText = <p>Looking for a random buddy</p>;
const stoppingSearchLoadingText = <p>Stopping the search</p>;
let timeout: any = null;

const Searching = () => {
  const { socket } = useSocket();
  const { endSearch, startSearch, app } = useApp();
  const { authState } = useAuth();
  const { createChat } = useChat();

  const notification = useNotification({ settings: app.settings });
  const router = useRouter();

  const [isStoppingSearch, setIsStoppingSearch] = useState(false);
  const [loadingText, setLoadingText] = useState(defaultLoadingText);

  const handleStopSearch = () => {
    socket?.emit(events.NEW_EVENT_STOP_SEARCH, {
      loginId: authState.loginId,
    });
    setIsStoppingSearch(true);
  };

  function handleReconnect() {
    if (socket?.connected) {
      return;
    }

    startSearch();
    setLoadingText(defaultLoadingText);
    socket?.connect();
  }

  useEffect(() => {
    setLoadingText(
      isStoppingSearch ? stoppingSearchLoadingText : defaultLoadingText
    );
  }, [isStoppingSearch]);

  useEffect(() => {
    if (!app.currentroom) {
      startSearch();
    }

    if (!socket?.connected) {
      socket?.connect();
    }

    socket?.emit(events.NEW_EVENT_JOIN, {
      loginId: authState.loginId,
      email: authState.email,
    });

    socket?.on(events.NEW_EVENT_STOP_SEARCH_SUCCESS, () => {
      setIsStoppingSearch(false);
      endSearch(null);
      router.push('/');
    });

    socket?.on(events.NEW_EVENT_JOINED, async ({ roomId, userIds }) => {
      try {
        await notification?.playNotification('buddyPaired');
        createBrowserNotification(
          "Let's Chat :)",
          "You've found a match, don't keep your Partner waiting ⌛"
        );

        createChat(roomId, userIds);
        endSearch(roomId);
        // need to check if the roomid exists before pushing to anonymous
        router.push('/anonymous');
      } catch (error) {
        console.log({ error });
      }
    });

    return () => {
      socket?.off(events.NEW_EVENT_STOP_SEARCH_SUCCESS);
    };
  }, [app.currentroom, authState.email, authState.loginId, router, socket]);

  useEffect(() => {
    if (!app.currentroom) {
      return;
    }

    router.push('/anonymous');
  }, [app.currentroom]);

  useEffect(() => {
    if (!app.currentroom) {
      return;
    }

    router.push('/anonymous')
  }, [app.currentChatId])

  useEffect(() => {
    if (loadingText === defaultLoadingText) {
      timeout = setTimeout(() => {
        setLoadingText(
          <>
            <p>
              Taking too long? <br className='md:hidden' />
              No <span className='hidden sm:inline'>chat</span> buddy is
              currently available :({' '}
            </p>
            <p>
              <a
                href='https://ctt.ac/US0h0'
                target='_blank'
                rel='noreferrer'
                className='text-blue-500 underline'
              >
                Tweet
              </a>{' '}
              about this app and get more people to use it!
            </p>
          </>
        );
      }, 15000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <PageWrapper>
      {app.disconnected ? (
        <div className='flex flex-col w-full justify-center items-center h-full bg-primary'>
          <Icon icon='ph:plugs-light' className='text-secondary h-24 w-24' />
          <p className='text-lg text-center text-white'>
            Sorry, it seems you&apos;re not connected
          </p>
          <div className='flex flex-col sm:flex-row gap-1 sm:gap-4 text-[1.5em] mt-4 font-medium items-center'>
            <button
              onClick={handleReconnect}
              className={
                'hover:no-underline hover:text-black text-black w-[8em] h-[2.3em] rounded-[30px] bg-[#FF9F1C] flex flex-col items-center justify-center'
              }
            >
              Try again
            </button>
            <Link
              href='/'
              className='underline text-white hover:text-white text-lg'
            >
              Return Home
            </Link>
          </div>
        </div>
      ) : (
        <div className='flex w-full justify-center items-center min-h-[calc(100vh-70px)] flex-col bg-light dark:bg-primary'>
          <ThreeDots fill='rgb(255 159 28)' />
          <div className='text-lg text-center text-primary dark:text-white'>
            {loadingText}
          </div>
          {!isStoppingSearch && (
            <button
              onClick={handleStopSearch}
              className={
                'hover:no-underline hover:text-white font-medium text-white text-[1.5em] w-[8em] h-[2.3em] mt-4 rounded-[30px] bg-[#FF3A46] flex flex-col items-center justify-center'
              }
            >
              Stop
            </button>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

export default Searching;
