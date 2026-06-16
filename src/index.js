import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Demo from './components/Demo';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Route /demo to the self-running demo, everything else to the full app
const isDemo = window.location.pathname === '/demo';
root.render(isDemo ? <Demo /> : <App />);
