import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import {
  AddressBook,
  Balance,
  Exchange,
  Login,
  Logout,
  NotFound,
  Send,
  Transactions,
  Wallets,
} from './containers';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/balance" component={Balance} />
          <Route path="/send" component={Send} />
          <Route path="/in-wallet-exchange" component={Exchange} />
          <Route path="/wallets" component={Wallets} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/address-book" component={AddressBook} />
          <Route path="/logout" component={Logout} />
          <Route path="/login" component={Login} />
          <Route path="/404" component={NotFound} />
          <Redirect exact from="/" to="/balance" />
          <Redirect from="*" to="/404" />
        </Switch>
      </Router>
    );
  }
}

export default App;
