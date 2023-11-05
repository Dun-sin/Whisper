import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useApp } from '@/context/AppContext';

import { Icon } from '@iconify/react';

import { requestBrowserNotificationPermissions } from '@/lib/browserNotification';

import PageWrapper from '@/components/PageWrapper';

const centerElement = 'flex flex-col items-center justify-center';
export default function Home() {
  const { app } = useApp();
  const navigate = useRouter();

  useEffect(() => {
    if (app.isSearching) {
      navigate.push('/searching');
    }

    requestBrowserNotificationPermissions();
  }, [app.settings, navigate, app.isSearching]);

  return (
    <PageWrapper>
      <div
        className={`${centerElement} bg-light dark:bg-primary min-w-[calc(100%-120px)] text-primary dark:text-white min-h-full`}
      >
        <Icon
          icon='mingcute:user-search-line'
          className='text-secondary mb-6'
        />
        <h1 className='text-[calc(1.2vh+1.2vh+1.2vmin)]'>Search For Someone</h1>

        {/* from the below link user will trigger search of another user*/}
        <Link
          href='/searching'
          className={`${centerElement} hover:no-underline hover:text-black font-medium text-black text-[1.5em] w-[8em] h-[2.3em] mt-[-5px] rounded-[30px] transition duration-300 ease-in-out bg-[#FF9F1C] hover:bg-[#FBBF24]`}
        >
          {app.currentChatId ? 'Open Chat' : 'Start'}
        </Link>
      </div>
    </PageWrapper>
  );
}
