import React, { Component, Fragment, Children, cloneElement } from 'react';
import { BTC_TO_USD, BITCOIN_SYMBOL_LOWER_CASED } from '../utils/constants';
import { fetchMarketInfo } from '../utils/ssTx';

const INITIAL_STATE = {
  balance: null,
  balanceCurrency: null,
  error: null,
  errorCurrency: null,
  hasBalance: false,
  loading: true,
  loadingCurrency: true,
};

export default class Balance extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    this.check();
  }

  componentDidUpdate(prevProps) {
    if (
      (!prevProps.wallet && this.props.wallet) ||
      (prevProps.wallet && prevProps.wallet.id !== this.props.wallet.id)
    ) {
      this.check();
    }
  }

  render() {
    const {
      balance,
      balanceCurrency,
      error,
      errorCurrency,
      hasBalance,
      loading,
      loadingCurrency,
    } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            balance,
            balanceHas: hasBalance,
            balanceLoading: loading,
            balanceError: error && (
              <div>There was an error fetching the wallet balance: {error}</div>
            ),
            balanceCurrency: balanceCurrency,
            balanceCurrencyLoading: loadingCurrency,
            balanceErrorCurrency: errorCurrency && (
              <div>
                There was an error exchanging the balance to USD:{' '}
                {errorCurrency}
              </div>
            ),
            ...rest,
          }),
        )}
      </Fragment>
    );
  }

  check = async () => {
    this.setState({ ...INITIAL_STATE });
    const { wallet } = this.props;
    if (!wallet) {
      return;
    }
    const { balanceURL, balanceProp, balanceUnit } = wallet;
    if (!balanceURL || !balanceProp || !balanceUnit) {
      return;
    }
    this.setState({ hasBalance: true });
    this.getBalance();
  };

  getBalance = async () => {
    const {
      publicAddress,
      balanceURL,
      balanceProp,
      balanceUnit,
    } = this.props.wallet;
    try {
      const res = await fetch(`${balanceURL}${publicAddress}`);
      const data = await res.json();
      if (!data.hasOwnProperty(balanceProp)) {
        this.setState({
          error: 'The response did not include the balance property',
        });
        return;
      }
      const balance = data[balanceProp] * balanceUnit;
      this.setState({ balance, loading: false });
      this.getBalanceCurrency(balance);
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };

  getBalanceCurrency = async balance => {
    // if not BTC get value in BTC
    const { symbol } = this.props.wallet;
    const symbolCased = symbol.toLowerCase();
    let toBTC = 1;
    if (symbolCased !== BITCOIN_SYMBOL_LOWER_CASED) {
      const { rate } = await fetchMarketInfo(
        symbolCased,
        BITCOIN_SYMBOL_LOWER_CASED,
      );
      toBTC = rate;
    }
    const res = await fetch(BTC_TO_USD);
    const { last: toUSD } = await res.json();
    const balanceCurrency = balance * toBTC * toUSD;
    this.setState({ balanceCurrency, loadingCurrency: false });
  };
}
