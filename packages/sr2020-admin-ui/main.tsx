import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';

import App from './app/app';
import { ToastProvider } from 'react-toast-notifications';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider autoDismiss={true}>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
