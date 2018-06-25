import React, { Component, Fragment, Children, cloneElement } from 'react';
import { getBalance } from '../utils/wallets';
import { getBalance as getBalanceToken } from '../utils/tokens';
import { TOKENS } from '../utils/erc20';

const UNAVAILABLE = 'Currently unavailable';

const INITIAL_STATE = {
  balances: [],
  loading: false,
};

class Balances extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    const { wallet, tokens, tokensLoading } = this.props;
    if (wallet && tokens && !tokensLoading) {
      this.get();
    }
  }

  componentDidUpdate(prevProps) {
    const { wallet, tokens, tokensLoading } = this.props;
    if (
      wallet &&
      tokens &&
      !tokensLoading &&
      ((!prevProps.wallet && wallet) ||
        (prevProps.wallet && prevProps.wallet.id !== wallet.id) ||
        prevProps.tokens.length !== tokens.length ||
        prevProps.tokensLoading !== tokensLoading)
    ) {
      this.get();
    }
  }

  render() {
    const { balances, loading } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            balances,
            balancesLoading: loading,
          }),
        )}
      </Fragment>
    );
  }

  get = async () => {
    this.setState({ loading: true }, async () => {
      const {
        wallet: { assets: assetsMaybeWithoutEth, privateKey },
        tokens,
      } = this.props;
      // add eth balance if there is an er20 token or a custom token
      let assets = assetsMaybeWithoutEth;
      if (
        !assets.includes('eth') &&
        (tokens.find(t => assets.includes(t.symbol)) ||
          Object.keys(TOKENS).find(symbol => assets.includes(symbol)))
      ) {
        assets = [...assetsMaybeWithoutEth, 'eth'];
      }

      const balances = await Promise.all(
        assets.map(
          async symbol => await this.getEach({ symbol, privateKey, tokens }),
        ),
      );

      this.setState({
        balances,
        loading: false,
      });
    });
  };

  getEach = async ({ symbol, privateKey, tokens }) => {
    try {
      const token = tokens.find(t => t.symbol === symbol);
      const balance = token
        ? await getBalanceToken({ privateKey, token })
        : await getBalance(symbol)(privateKey);
      return { symbol, balance };
    } catch (e) {
      //console.warn('-- Could not get balance: ', e);
      return { symbol, balance: UNAVAILABLE };
    }
  };
}

export default Balances
