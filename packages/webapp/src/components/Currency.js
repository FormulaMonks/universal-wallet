import React, { Component, Fragment, Children, cloneElement } from 'react';
import { BITCOIN_SYMBOL_LOWER_CASED } from '../utils/btc';
import { fetchMarketInfo } from '../utils/ss';
import Compose from './Compose';

const BTC_TO_USD = 'https://www.bitstamp.net/api/v2/ticker/btcusd/?cors=1';

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
    if (
      prevProps.balance !== this.props.balance ||
      prevProps.balanceSymbol !== this.props.balanceSymbol
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
      const { balance, balanceSymbol } = this.props;
      if ((!balance && balance !== 0) || !balanceSymbol) {
        return;
      }
      this.get();
    });
  };

  get = async () => {
    this.setState({ loading: true });
    const { balance, balanceSymbol } = this.props;
    // if not BTC get value in BTC
    const symbolCased = balanceSymbol.toLowerCase();
    let toBTC = 1;
    if (symbolCased !== BITCOIN_SYMBOL_LOWER_CASED) {
      try {
        const { rate } = await fetchMarketInfo(
          symbolCased,
          BITCOIN_SYMBOL_LOWER_CASED,
        );
        toBTC = rate;
      } catch (e) {
        this.setState({
          error: (
            <div>
              There was an error getting the exchange rate to BTC:{' '}
              {e.toString()}
            </div>
          ),
          loading: false,
        });
        return;
      }
    }
    try {
      const res = await fetch(BTC_TO_USD);
      const { last: toUSD } = await res.json();
      const currency = balance * toBTC * toUSD;
      if (!isNaN(currency)) {
        this.setState({ currency });
      }
    } catch (e) {
      this.setState({
        error: (
          <div>
            There was an error getting the exchange rate to USD: {e.toString()}
          </div>
        ),
      });
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
