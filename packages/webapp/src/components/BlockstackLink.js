import React, { Component, Fragment } from 'react';
import QrR from 'react-qr-reader';

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
          <div>In short you will be redirected to setup your Blockstack info</div>
        );
      }

      localStorage.setItem('BLOCKSTACK_LINK', url);
      return <div>The link has been set, you are ready to sign in.</div>;
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
        <button onClick={() => this.setState({ mode: 'setup' })}>Setup</button>
        <button onClick={() => this.setState({ mode: 'link' })}>Link</button>
      </Fragment>
    );
  }
}
