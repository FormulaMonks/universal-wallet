import React, { Component, Fragment, Children, cloneElement } from 'react';
import { SYMBOL } from '../utils/btc';
import { fetchMarketInfo } from '../utils/ss';
import Compose from './Compose';
import { Spinner } from './';

const BTC_TO_USD = 'https://api.coindesk.com/v1/bpi/currentprice.json';

const CURRENTLY_UNAVAILABLE = 'Currently unavailable';

const INITIAL_STATE = {
  currency: { total: 0 },
  error: null,
  loading: true,
};

class Store extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    if (this.props.balances) {
      this.getAll();
    }
  }

  componentDidUpdate(prevProps) {
    const { balances } = this.props;
    if (
      (!prevProps.balances && balances) ||
      prevProps.balances.length !== balances.length
    ) {
      this.getAll();
    }
  }

  render() {
    const { currency, error, loading } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            totalCurrency: currency,
            totalCurrencyLoading: loading,
            totalCurrencyError: error,
          }),
        )}
      </Fragment>
    );
  }

  getAll = () => {
    this.setState({ ...INITIAL_STATE }, async () => {
      let toUSD = null;
      try {
        const raw = await fetch(BTC_TO_USD);
        const { bpi: { USD: { rate_float } } } = await raw.json();
        toUSD = rate_float;
      } catch (e) {
        console.warn(
          `-- Could not fetch exchange rate from USD to ${SYMBOL}: `,
          e,
        );
      }

      const { balances, wallet: { assets } } = this.props;
      const currency = await Promise.all(
        balances.map(async ({ symbol, balance }) => {
          return {
            currency: await this.get({ symbol, balance, toUSD }),
            symbol,
          };
        }),
      );

      // TODO: improve this
      // added eth balance for cases where an asset is a custom token or an erc20 token
      // only add eth to total if it is an actual asset
      currency.total = currency.reduce(
        (p, { currency, symbol }) =>
          !isNaN(currency) && assets.includes(symbol) ? p + currency : p,
        0,
      );
      this.setState({ currency, loading: false });
    });
  };

  get = async ({ symbol, balance, toUSD }) => {
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
    let toBTC = 1;
    if (symbol !== SYMBOL) {
      try {
        const { rate } = await fetchMarketInfo(symbol, SYMBOL);
        toBTC = rate;
      } catch (e) {
        //console.warn(
        //`-- Could not fetch exchange rate from ${symbol} to ${SYMBOL}: `,
        //e,
        //);
        return CURRENTLY_UNAVAILABLE;
      }
    }
    const currency = balance * toBTC * toUSD;
    if (!isNaN(currency)) {
      return currency;
    }
    return CURRENTLY_UNAVAILABLE;
  };
}

const View = ({
  totalCurrency,
  totalCurrencyError,
  totalCurrencyLoading,
  balancesLoading,
}) => {
  const { total } = totalCurrency;

  if (totalCurrencyError) {
    return totalCurrencyError;
  }

  if (balancesLoading || totalCurrencyLoading) {
    return '.';
  }

  if (isNaN(total)) {
    return 'Currently unavailable';
  }

  return `$${total.toLocaleString()}`;
};

const Loaded = ({ children, ...rest }) => {
  const { totalCurrencyLoading } = rest;
  if (totalCurrencyLoading) {
    return <Spinner />;
  }

  return (
    <Fragment>
      {Children.map(children, child => cloneElement(child, { ...rest }))}
    </Fragment>
  );
};

export { View, Store, Loaded };
export default Compose(Store, View);
