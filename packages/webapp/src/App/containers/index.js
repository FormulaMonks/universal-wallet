import React from 'react';
import { Header } from '../components';

const Mock = ({ section }) => (
  <div>
    <Header />
    {section}
  </div>
);

export const Send = () => <Mock section="send" />;
export const Exchange = () => <Mock section="in wallet exchange" />;
export const Transactions = () => <Mock section="transaction history" />;
export const NotFound = () => <Mock section="404" />;

export { default as Balance } from './Balance/Balance';
export { default as Wallets } from './Wallets/Wallets';
export { default as AddressBook } from './AddressBook/AddressBook';
