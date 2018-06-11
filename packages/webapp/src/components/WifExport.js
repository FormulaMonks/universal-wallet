import React, { Component, Fragment, Children, cloneElement } from 'react';
import styled from 'styled-components';
import { Center, StickySummary } from '../theme';
import { toWif, toWifAvailable } from '../utils/wallets';
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
      <StickySummary>
        <H4>WIF</H4>
      </StickySummary>

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
    if (
      (!prevProps.wallet && this.props.wallet) ||
      (prevProps.wallet && prevProps.wallet.id !== this.props.wallet.id)
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

    const { privateKey, symbol } = wallet;

    if (
      !toWifAvailable().find(
        i => i.symbol.toLowerCase() === symbol.toLowerCase(),
      )
    ) {
      return null;
    }

    try {
      const wif = toWif(symbol)(privateKey)
      this.setState({ wif });
    } catch (e) {
      console.error('--Could not export wallet to WIF error: ', e);
    }
  };
}

const WifExport = Compose(Store, View);

export { View, Store };
export default WifExport;
