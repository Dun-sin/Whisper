import '@/styles/globals.css';
import 'rsuite/dist/rsuite.min.css';

import type { AppProps } from 'next/app';

import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/Context';
import { DialogProvider } from '@/context/DialogContext';

import Dialog from '@/components/Dialog';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppProvider>
          <DialogProvider>
            <Component {...pageProps} />
            <Dialog />
          </DialogProvider>
        </AppProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
