import React, { Component, Fragment, Children, cloneElement } from 'react';
import { getBalance } from '../utils/wallets';
import { getBalance as getBalanceToken } from '../utils/tokens';
import Compose from './Compose';
import numberToLocale from '../utils/numberToLocale';

const UNAVAILABLE = 'Currently unavailable';

const INITIAL_STATE = {
  balance: 0,
  loading: false,
};

class Store extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    const { wallet, symbol, tokens, tokensLoading } = this.props;
    if (wallet && symbol && tokens && !tokensLoading) {
      this.get();
    }
  }

  componentDidUpdate(prevProps) {
    const { symbol, wallet, tokens, tokensLoading } = this.props;
    if (
      wallet &&
      symbol &&
      tokens &&
      !tokensLoading &&
      ((!prevProps.wallet && wallet) ||
        (prevProps.wallet && prevProps.wallet.id !== wallet.id) ||
        (!prevProps.symbol && symbol) ||
        prevProps.symbol !== symbol ||
        (!prevProps.tokens && tokens) ||
        prevProps.tokens.length !== tokens.length ||
        prevProps.tokensLoading !== tokensLoading)
    ) {
      this.get();
    }
  }

  render() {
    const { balance, loading } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            balance,
            balanceLoading: loading,
          }),
        )}
      </Fragment>
    );
  }

  get = async () => {
    this.setState({ ...INITIAL_STATE, loading: true }, async () => {
      const { wallet: { privateKey }, symbol, tokens } = this.props;
      const balance = await this.getBalance({ symbol, privateKey, tokens });
      this.setState({ balance, loading: false });
    });
  };

  getBalance = async ({ symbol, privateKey, tokens }) => {
    try {
      const token = tokens.find(t => t.symbol === symbol);
      return token
        ? await getBalanceToken({ privateKey, token })
        : await getBalance(symbol)(privateKey);
    } catch (e) {
      console.warn('-- Could not get balance: ', e);
      return 'Currently unavailable';
    }
  };
}

const View = ({ balance, symbol, balanceLoading, tokensLoading }) => {
  if (balanceLoading || tokensLoading) {
    return '.';
  }

  if (isNaN(balance)) {
    return UNAVAILABLE;
  }

  return (
    <Fragment>
      {symbol.toUpperCase()} {numberToLocale(balance)}
    </Fragment>
  );
};

export { View, Store };
export default Compose(Store, View);
