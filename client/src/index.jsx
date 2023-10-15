import { createRoot } from 'react-dom/client';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';


import App from './App';
import Dialog from './components/Dialog';

import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { socket, SocketContext } from 'context/Context';
import { DialogProvider } from './context/DialogContext';

import 'rsuite/dist/rsuite.min.css';
import 'styles/index.css';
import { DarkModeProvider } from './context/DarkModeContext';


const root = createRoot(document.getElementById('root'));

root.render(<DarkModeProvider>
    <AuthProvider>
        <AppProvider>
            <Router>
                <SocketContext.Provider value={socket}>
                    <DialogProvider>
                        <App />
                        <Dialog />
                    </DialogProvider>
                </SocketContext.Provider>
            </Router>
        </AppProvider>
    </AuthProvider>
</DarkModeProvider>);
