import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Store
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ChatProvider } from '@/context/ChatContext';

// Components
import NavBar from './NavBar';

import useIsTabActive from '@/hooks/useIsTabActive';
import { ProviderType } from '@/types/propstypes';

const PageWrapper = ({ children }: ProviderType) => {
  const { isLoggedIn } = useAuth();
  const { updateOnlineStatus, app } = useApp();
  const router = useRouter();
  const { settings } = app;

  const [onlineStatus, setOnlineStatus] = useState<Date | string | null>(null);

  const isTabActive = useIsTabActive();

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
