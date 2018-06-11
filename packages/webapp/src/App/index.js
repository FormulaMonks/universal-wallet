import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import Home from './Home'
import Wallet from './Wallet'
import AddressBook from './AddressBook';
import NewWallet from './NewWallet'
import NotFound from './NotFound'
import { Auth } from '../components';

class App extends Component {
  render() {
    return (
      <Router>
        <Auth>
          <Switch>
            <Route path="/404" component={NotFound} />
            <Route exact path="/" component={Home} />
            <Route path="/address-book" component={AddressBook} />
            <Route path="/new-wallet" component={NewWallet} />
            <Route exact path="/:id" component={Wallet} />
            <Redirect from="*" to="/404" />
          </Switch>
        </Auth>
      </Router>
    );
  }
}

export default App;
