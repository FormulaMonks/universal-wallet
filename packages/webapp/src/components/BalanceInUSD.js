import React, { Component, Fragment, Children, cloneElement } from 'react';
import { SYMBOL } from '../utils/btc';
import { fetchMarketInfo } from '../utils/ss';
import Compose from './Compose';
import numberToLocale from '../utils/numberToLocale';

const BTC_TO_USD = 'https://api.coindesk.com/v1/bpi/currentprice.json';

const CURRENTLY_UNAVAILABLE = 'Currently unavailable';

const INITIAL_STATE = {
  inUSD: 0,
  loading: false,
};

class Store extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    const { coins, coinsLoading, balance, symbol } = this.props;
    if (balance !== null && symbol && coins && !coinsLoading) {
      this.get();
    }
  }

  componentDidUpdate(prevProps) {
    const { balance, symbol, coins, coinsLoading } = this.props;
    if (
      balance !== null &&
      symbol &&
      coins &&
      !coinsLoading &&
      (prevProps.balance !== balance ||
        prevProps.symbol !== symbol ||
        prevProps.coins.length !== coins.length)
    ) {
      this.get();
    }
  }

  render() {
    const { inUSD, loading } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            balanceInUSD: inUSD,
            balanceInUSDLoading: loading,
          }),
        )}
      </Fragment>
    );
  }

  get = async () => {
    this.setState({ ...INITIAL_STATE, loading: true }, async () => {
      // if not a coin it is a custom token, so not available
      const { coins = [], symbol, balance } = this.props;
      if (
        coins.length &&
        (!coins.find(c => c.symbol === symbol) ||
          coins.find(c => c.symbol === symbol && c.status === 'unavailable'))
      ) {
        this.setState({ inUSD: CURRENTLY_UNAVAILABLE, loading: false });
        return;
      }

      // if not BTC get value in BTC
      let rateToUSD = null;
      try {
        const raw = await fetch(BTC_TO_USD);
        const { bpi: { USD: { rate_float } } } = await raw.json();
        rateToUSD = rate_float;
      } catch (e) {
        console.warn(
          `-- Could not fetch exchange rate from USD to ${SYMBOL}: `,
          e,
        );
        this.setState({ inUSD: CURRENTLY_UNAVAILABLE, loading: false });
        return;
      }

      let rateToBTC = 1;
      if (symbol !== SYMBOL) {
        try {
          const { rate } = await fetchMarketInfo(symbol, SYMBOL);
          rateToBTC = rate;
        } catch (e) {
          console.warn(
            `-- Could not fetch exchange rate from ${symbol} to ${SYMBOL}: `,
            e,
          );
          this.setState({ inUSD: CURRENTLY_UNAVAILABLE, loading: false });
          return;
        }
      }

      const inUSD = balance * rateToBTC * rateToUSD;
      if (isNaN(inUSD)) {
        this.setState({ inUSD: CURRENTLY_UNAVAILABLE, loading: false });
        return;
      }
      this.setState({ inUSD, loading: false });
    });
  };
}

const View = ({ balanceInUSD, balanceInUSDLoading, coinsLoading }) => {
  if (balanceInUSDLoading || coinsLoading) {
    return '.';
  }

  return (
    <Fragment>
      {isNaN(balanceInUSD) ? balanceInUSD : `$${numberToLocale(balanceInUSD)}`}
    </Fragment>
  );
};

export { View, Store };
export default Compose(Store, View);
