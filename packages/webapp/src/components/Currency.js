import React, { Component, Fragment, Children, cloneElement } from 'react';
import { SYMBOL } from '../utils/btc';
import { fetchMarketInfo } from '../utils/ss';
import Compose from './Compose';

const BTC_TO_USD = 'https://api.coindesk.com/v1/bpi/currentprice.json';

const INITIAL_STATE = {
  currency: null,
  error: null,
  loading: false,
};

class Store extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    this.check();
  }

  componentDidUpdate(prevProps) {
    const { balance, balanceSymbol, balanceError } = this.props;
    if (
      prevProps.balance !== balance ||
      prevProps.balanceSymbol !== balanceSymbol ||
      prevProps.balanceError !== balanceError
    ) {
      this.check();
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
            currency,
            currencyLoading: loading,
            currencyError: error,
          }),
        )}
      </Fragment>
    );
  }

  check = async () => {
    this.setState({ ...INITIAL_STATE }, () => {
      const { balance, balanceSymbol, balanceError, coins = [] } = this.props;
      if (
        balanceError ||
        (coins.length && !coins.find(({ symbol }) => symbol === balanceSymbol))
      ) {
        this.setState({
          error: <div>Currently unavailable</div>,
          loading: false,
        });
        return;
      }
      if (balance === 0) {
        this.setState({ currency: 0, loading: false });
        return;
      }
      if (
        !balance ||
        !balanceSymbol ||
        (isNaN(balance) && !Array.isArray(balance))
      ) {
        return;
      }
      this.get();
    });
  };

  get = async () => {
    this.setState({ loading: true });
    const { balance, balanceSymbol } = this.props;

    // if not BTC get value in BTC
    let toBTC = 1;
    if (balanceSymbol !== SYMBOL) {
      try {
        const { rate } = await fetchMarketInfo(balanceSymbol, SYMBOL);
        toBTC = rate;
      } catch (e) {
        this.setState({
          error: <div>Currently unavailable</div>,
          loading: false,
        });
        return;
      }
    }
    try {
      const raw = await fetch(BTC_TO_USD);
      const { bpi: { USD: { rate_float: toUSD } } } = await raw.json();
      const currency = balance * toBTC * toUSD;
      if (!isNaN(currency)) {
        this.setState({ currency });
      }
    } catch (e) {
      this.setState({ error: <div>Currently unavailable</div> });
    }
    this.setState({ loading: false });
  };
}

const View = ({ currency, currencyError, currencyLoading }) => {
  if (!currency && currency !== 0 && !currencyError && !currencyLoading) {
    return null;
  }

  return (
    <Fragment>
      {currencyError}
      {currencyLoading && '.'}
      {currency && <Fragment>${currency}</Fragment>}
    </Fragment>
  );
};

export { View, Store };
export default Compose(Store, View);
