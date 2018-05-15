import React from 'react';
import { Header } from '../components'

const Mock = ({ section }) => <div>
  <Header />
  {section}
</div>;

export const Login = () => <Mock section="login" />;
export const Balance = () => <Mock section="balance + receive" />;
export const Send = () => <Mock section="send" />;
export const Exchange = () => <Mock section="in wallet exchange" />;
export const Wallets = () => <Mock section="wallets" />;
export const Transactions = () => <Mock section="transaction history" />;
export const AddressBook = () => <Mock section="address book" />;
export const NotFound = () => <Mock section="404" />;
export const Logout = () => <Mock section="logout" />;
