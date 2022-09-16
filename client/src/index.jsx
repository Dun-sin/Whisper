import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './assets/css/index.css'
import App from './App';
import { Provider } from 'react-redux';
import store from './context/redux/store'

render(
    <React.StrictMode>
        <Provider store={store}>
            <Router>
                <App />
            </Router>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
