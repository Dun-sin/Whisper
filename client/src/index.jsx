import { createRoot } from 'react-dom/client';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import Dialog from './components/Dialog';

import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { DialogProvider } from './context/DialogContext';

import 'rsuite/dist/rsuite.min.css';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
	<AuthProvider>
		<AppProvider>
			<Router>
				<DialogProvider>
					<App />
					<Dialog />
				</DialogProvider>
			</Router>
		</AppProvider>
	</AuthProvider>
);
