import React from 'react';
import { render } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';

import App from './app';
import { ToastProvider } from 'react-toast-notifications';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>,
    );

    expect(baseElement).toBeTruthy();
  });
});
