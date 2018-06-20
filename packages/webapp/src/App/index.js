import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import Home from './Home'
import Wallets from './Wallets'
import Wallet from './Wallet'
import WalletAsset from './WalletAsset'
import AddressBook from './AddressBook';
import NewWallet from './NewWallet'
import CustomTokens from './CustomTokens'
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
            <Route path="/custom-tokens" component={CustomTokens} />
            <Route exact path="/wallets" component={Wallets} />
            <Route exact path="/wallets/:id" component={Wallet} />
            <Route exact path="/wallets/:id/:symbol" component={WalletAsset} />
            <Redirect from="*" to="/404" />
          </Switch>
        </Auth>
      </Router>
    );
  }
}

export default App;
