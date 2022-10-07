import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import 'styles/index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import "rsuite/dist/rsuite.min.css";

render(
    <AuthProvider>
            <Router>
                <App />
            </Router>
    </AuthProvider>,
    document.getElementById('root')
);
