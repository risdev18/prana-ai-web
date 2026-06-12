import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (err) {
  console.error('Fatal render error:', err);
  document.getElementById('root').innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#070514;padding:24px;text-align:center;font-family:sans-serif">
      <div style="font-size:48px;margin-bottom:16px">⚡</div>
      <h2 style="color:#F8F9FD;margin-bottom:12px">App failed to load</h2>
      <p style="color:#A5A6C2;margin-bottom:24px;font-size:14px">Please check your connection and try again.</p>
      <button onclick="window.location.reload()" style="padding:12px 28px;border-radius:12px;border:none;background:linear-gradient(135deg,#7C5CFF,#5DA9FF);color:#fff;font-size:15px;font-weight:700;cursor:pointer">Reload</button>
    </div>
  `;
}
