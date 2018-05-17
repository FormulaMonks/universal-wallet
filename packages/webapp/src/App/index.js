import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import Balance from './Balance';
import Send from './Send';
import Wallets from './Wallets';
import Contacts from './Contacts';
import { Auth } from '../components';

import { Header } from '../components';
const Mock = ({ section }) => (
  <div>
    <Header />
    {section}
  </div>
);
const Exchange = () => <Mock section="in wallet exchange" />;
const Transactions = () => <Mock section="transaction history" />;
const NotFound = () => <Mock section="404" />;

class App extends Component {
  render() {
    return (
      <Router>
        <Auth>
          <Switch>
            <Redirect exact from="/" to="/balance" />
            <Route path="/404" component={NotFound} />
            <Route path="/balance" component={Balance} />
            <Route path="/send" component={Send} />
            <Route path="/in-wallet-exchange" component={Exchange} />
            <Route path="/wallets" component={Wallets} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/contacts" component={Contacts} />
            <Redirect from="*" to="/404" />
          </Switch>
        </Auth>
      </Router>
    );
  }
}

export default App;
