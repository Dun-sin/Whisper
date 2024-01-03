import '@/styles/globals.css';
import 'rsuite/dist/rsuite.min.css';

import type { AppProps } from 'next/app';

import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { DialogProvider } from '@/context/DialogContext';
import { ChatProvider } from '@/context/ChatContext';

import Dialog from '@/components/Dialog';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppProvider>
        <SocketProvider>
          <DialogProvider>
            <ChatProvider>
              <Component {...pageProps} />
              <Dialog />
            </ChatProvider>
          </DialogProvider>
        </SocketProvider>
      </AppProvider>
    </AuthProvider>
  );
}
