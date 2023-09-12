import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import 'styles/index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import 'rsuite/dist/rsuite.min.css';
import { socket, SocketContext } from 'context/Context';
import { DialogProvider } from './context/DialogContext';
import Dialog from './components/Dialog';


const root = createRoot(document.getElementById('root'))
root.render(<AuthProvider>
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
</AuthProvider>)
