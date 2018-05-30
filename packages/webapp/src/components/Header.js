import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { signUserOut } from 'blockstack';

export default class Header extends Component {
  render() {
    return (
      <Fragment>
        {process.env.REACT_APP_TESTNET ? <div>Testnet ON</div> : null}
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="wallets">Wallets</Link>
          </li>
          <li>
            <Link to="contacts">Contacts</Link>
          </li>
          <li>
            <button onClick={this.onLogout}>Logout</button>
          </li>
        </ul>
      </Fragment>
    );
  }

  onLogout = () => {
    signUserOut(window.location.origin);
  };
}
