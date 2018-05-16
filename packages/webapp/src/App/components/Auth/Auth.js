import React, { Component, Fragment } from 'react';
import {
  handlePendingSignIn,
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
} from 'blockstack';

const LOADING = 'checking current state';
const LOGGED_IN = 'logged in';
const LOGGED_OUT = 'logged out';

export default class Auth extends Component {
  state = { auth: LOADING };

  async componentDidMount() {
    if (isSignInPending()) {
      await handlePendingSignIn();
    }
    const res = isUserSignedIn();
    this.setState({ auth: res ? LOGGED_IN : LOGGED_OUT });
  }

  render() {
    const { auth } = this.state;

    return (
      <Fragment>
        {auth === LOADING && <div>Loading</div>}
        {auth === LOGGED_IN && this.props.children}
        {auth === LOGGED_OUT && <button onClick={this.onSignIn}>Sign in</button>}
      </Fragment>
    );
  }

  onSignIn = () => {
    const url = window.location.href;
    redirectToSignIn(url, document.location.origin + '/manifest.json');
  };
}
