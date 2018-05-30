import React, { Component, Fragment, Children, cloneElement } from 'react';
import { BTC_TO_USD, BITCOIN_SYMBOL_LOWER_CASED } from '../utils/constants';
import { fetchMarketInfo } from '../utils/ssTx';

const INITIAL_STATE = {
  currency: null,
  error: null,
  loading: false,
};

export class Store extends Component {
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
      if (!balance || !balanceSymbol) {
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
      this.setState({ currency });
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

export const View = ({ currency, currencyError, currencyLoading }) => (
  <Fragment>
    {currencyError}
    {currencyLoading && <div>loading</div>}
    {currency && <div>{currency} USD</div>}
  </Fragment>
);
