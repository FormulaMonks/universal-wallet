import React, { Component, Fragment } from 'react';
import QrR from 'react-qr-reader';
import { Button, Center } from '../theme'

export default class BlockstackLink extends Component {
  state = { mode: null, url: null };

  render() {
    const { mode, url } = this.state;

    if (url) {
      if (mode === 'setup') {
        setTimeout(() => {
          window.location = url;
        }, 3000);
        return (
          <Center>In short you will be redirected to setup your Blockstack info</Center>
        );
      }

      localStorage.setItem('BLOCKSTACK_LINK', url);
      return <Center>The link has been set, you are ready to sign in.</Center>;
    }

    if (mode) {
      return (
        <Fragment>
          <QrR
            delay={300}
            onScan={url => {
              url && this.setState({ url });
            }}
            onError={err => console.log('err: ', err)}
          />
        </Fragment>
      );
    }

    return (
      <Fragment>
        <Button onClick={() => this.setState({ mode: 'link' })}>Link your device</Button>
        <Button onClick={() => this.setState({ mode: 'setup' })}>Setup Blockstack Link</Button>
      </Fragment>
    );
  }
}
