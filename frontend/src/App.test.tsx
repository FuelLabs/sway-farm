import { render, screen } from '@testing-library/react';
import React from 'react';

import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
const myWallet = new WalletLocked("fuel1grwpluruc9jvfj8f28e3knqp8rr4qneed6j0k4vsrg0avjetveysmyl0cp");
console.log("WALLET:", myWallet.address.toB256());
