import React, { Component, Fragment } from 'react';
import {
  handlePendingSignIn,
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
} from 'blockstack';
import styled from 'styled-components';
import { Header, BlockstackLink, Spinner } from './';
import { Button } from '../theme'

const Wrap = styled.div`
  & button {
    display: block;
    margin: 3em auto;
    width: 100%;
  }
`;

const Content = styled.div`
  width: 70%;
  margin: auto;
`;

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
        {auth === LOGGED_IN && this.props.children}
        {auth === LOADING && (
          <Fragment>
            <Header />
            <Spinner />
          </Fragment>
        )}
        {auth === LOGGED_OUT && (
          <Wrap>
            <Header />
            <Content>
              <Button onClick={this.onSignIn}>Sign in with Blockstack</Button>
              <BlockstackLink />
            </Content>
          </Wrap>
        )}
      </Fragment>
    );
  }

  onSignIn = () => {
    const url = document.location.href;
    const manifest = document.location.origin + '/manifest.json';
    redirectToSignIn(url, manifest);
  };
}
