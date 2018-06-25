import React, { Component, Fragment, Children, cloneElement } from 'react';
import { SYMBOL } from '../utils/btc';
import { fetchMarketInfo } from '../utils/ss';
import Compose from './Compose';
import numberToLocale from '../utils/numberToLocale';

const BTC_TO_USD = 'https://api.coindesk.com/v1/bpi/currentprice.json';

const CURRENTLY_UNAVAILABLE = 'Currently unavailable';

const INITIAL_STATE = {
  inUSD: [],
  total: 0,
  loading: false,
};

class Store extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    const { balances, coins, coinsLoading } = this.props;
    if (balances && coins && !coinsLoading) {
      this.getAll();
    }
  }

  componentDidUpdate(prevProps) {
    const { balances, coins, coinsLoading } = this.props;
    if (
      balances &&
      coins &&
      !coinsLoading &&
      ((!prevProps.balances && balances) ||
        prevProps.balances.length !== balances.length ||
        ((!prevProps.coins && coins) ||
          prevProps.coins.length !== coins.length) ||
        (!prevProps.coinsLoading && coinsLoading))
    ) {
      this.getAll();
    }
  }

  render() {
    const { inUSD, total, loading } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            balancesInUSD: inUSD,
            balancesInUSDTotal: total,
            balancesInUSDLoading: loading,
          }),
        )}
      </Fragment>
    );
  }

  getAll = () => {
    this.setState({ ...INITIAL_STATE, loading: true }, async () => {
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
      }

      const { balances, wallet: { assets } } = this.props;
      const inUSD = await Promise.all(
        balances.map(async ({ symbol, balance }) => {
          return {
            balanceInUSD: await this.get({ symbol, balance, rateToUSD }),
            symbol,
          };
        }),
      );

      // TODO: improve this
      // added eth balance for cases where an asset is a custom token or an erc20 token
      // only add eth to total if it is an actual asset
      const total = inUSD.reduce(
        (p, { balanceInUSD, symbol }) =>
          !isNaN(balanceInUSD) && assets.includes(symbol)
            ? p + balanceInUSD
            : p,
        0,
      );

      this.setState({ inUSD, total, loading: false });
    });
  };

  get = async ({ symbol, balance, rateToUSD }) => {
    // if not a coin it is a custom token, so not available
    const { coins = [] } = this.props;
    if (
      coins.length &&
      (!coins.find(c => c.symbol === symbol) ||
        coins.find(c => c.symbol === symbol && c.status === 'unavailable'))
    ) {
      return CURRENTLY_UNAVAILABLE;
    }
    // if not BTC get value in BTC
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
        return CURRENTLY_UNAVAILABLE;
      }
    }
    const balanceInUSD = balance * rateToBTC * rateToUSD;
    if (isNaN(balanceInUSD)) {
      return CURRENTLY_UNAVAILABLE;
    }
    return balanceInUSD;
  };
}

const View = ({
  coinsLoading,
  balancesLoading,
  balancesInUSDLoading,
  balancesInUSDTotal,
}) => {
  if (balancesLoading || balancesInUSDLoading || coinsLoading) {
    return '.';
  }

  if (isNaN(balancesInUSDTotal)) {
    return 'Currently unavailable';
  }

  return `$${numberToLocale(balancesInUSDTotal)}`;
};

export { Store };
export default Compose(Store, View);
