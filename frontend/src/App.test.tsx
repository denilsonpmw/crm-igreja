import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App without crashing (toast container present)', () => {
  render(<App />);
  // ToastContainer is injected in App; check for a role or accessible text used by react-toastify
  const toasts = document.querySelector('.Toastify');
  expect(toasts).toBeInTheDocument();
});
