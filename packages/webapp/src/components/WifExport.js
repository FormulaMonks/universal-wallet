import React, { Component, Fragment, Children, cloneElement } from 'react';
import styled from 'styled-components';
import { Center } from '../theme';
import { PrivateKey } from 'bitcore-lib';
import qr from 'qr-encode';
import Compose from './Compose';

const Centered = Center.extend`
  margin: 2em auto;
`;

const H4 = styled.h4`
  display: inline-block;
`;

const Div = styled.div`
  margin-top: 1em;
  font-size: 12px;
  word-break: break-all;
  min-height: 17px;
`;

const View = ({ wif, walletsLoading }) => {
  if (!wif || walletsLoading) {
    return null;
  }

  return (
    <details key={Date.now()}>
      <summary>
        <H4>WIF</H4>
      </summary>

      <Centered>
        <img src={qr(wif)} alt={wif} />
        <Div>{wif}</Div>
      </Centered>
    </details>
  );
};

class Store extends Component {
  state = { wif: null };

  componentDidMount() {
    this.get();
  }

  componentDidUpdate(prevProps) {
    const { wallet, token } = this.props;
    if (
      (!prevProps.wallet && wallet) ||
      (prevProps.wallet && prevProps.wallet.id !== wallet.id) ||
      (token && !prevProps.token)
    ) {
      this.get();
    }
  }

  render() {
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            ...this.state,
          }),
        )}
      </Fragment>
    );
  }

  get = () => {
    const { wallet, walletsLoading } = this.props;
    if (!wallet || walletsLoading) {
      return null;
    }

    const { privateKey } = wallet;
    try {
      const pk = new PrivateKey(privateKey);
      const wif = pk.toWIF();
      this.setState({ wif });
    } catch (e) {
      console.error('--Could not export wallet to WIF error: ', e);
    }
  };
}

const WifExport = Compose(Store, View);

export { View, Store };
export default WifExport;
