import React, { Component, Fragment } from 'react';
import { Button, Center } from '../theme';

export default class BlockstackLink extends Component {
  state = { mode: null, url: null };

  componentDidUpdate(prevProps) {
    const { qrData } = this.props;
    if (!prevProps.qrData && qrData) {
      this.setState({ url: qrData });
    }
  }

  render() {
    const { mode, url } = this.state;

    if (url) {
      if (mode === 'setup') {
        setTimeout(() => {
          window.location = url;
        }, 3000);
        return (
          <Center>
            You will be redirected to setup your Blockstack info
          </Center>
        );
      }

      localStorage.setItem('BLOCKSTACK_LINK', url);
      return <Center>The link has been set, you are ready to sign in.</Center>;
    }

    return (
      <Fragment>
        <Button
          onClick={() => this.setState({ mode: 'link' }, this.props.qrScan)}
        >
          Link your device
        </Button>
        <Button
          onClick={() => this.setState({ mode: 'setup' }, this.props.qrScan)}
        >
          Setup Blockstack Link
        </Button>
      </Fragment>
    );
  }
}
