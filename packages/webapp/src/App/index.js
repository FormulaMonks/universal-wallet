import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import {
  Balance,
  Send,
  Exchange,
  Wallets,
  Transactions,
  AddressBook,
  NotFound,
} from './containers';
import { Auth } from './components';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/404" component={NotFound} />
          <Redirect exact from="/" to="/balance" />
          <Auth>
            <Route path="/balance" component={Balance} />
            <Route path="/send" component={Send} />
            <Route path="/in-wallet-exchange" component={Exchange} />
            <Route path="/wallets" component={Wallets} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/address-book" component={AddressBook} />
          </Auth>
          <Redirect from="*" to="/404" />
        </Switch>
      </Router>
    );
  }
}

export default App;
