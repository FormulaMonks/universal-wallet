import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import Home from './Home'
import Wallets from './Wallets';
import Wallet from './Wallet'
import Contacts from './Contacts';
import { Auth } from '../components';

const NotFound = () => <div>404</div>;

class App extends Component {
  render() {
    return (
      <Router>
        <Auth>
          <Switch>
            <Route path="/404" component={NotFound} />
            <Route exact path="/" component={Home} />
            <Route path="/wallets" component={Wallets} />
            <Route path="/contacts" component={Contacts} />
            <Route exact path="/:id" component={Wallet} />
            <Redirect from="*" to="/404" />
          </Switch>
        </Auth>
      </Router>
    );
  }
}

export default App;
