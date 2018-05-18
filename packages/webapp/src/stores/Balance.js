import React, { Component, Fragment, Children, cloneElement } from 'react';
import {
  BTC_TO_USD,
  SHAPESHIFT_MARKETINFO,
  BITCOIN_SYMBOL_LOWER_CASED,
} from '../utils/constants';

const INITIAL_STATE = {
  balance: null,
  balanceCurrency: null,
  error: null,
  errorCurrency: null,
  hasBalance: false,
  loading: true,
  loadingCurrency: true,
};

const stateIsInitial = state =>
  Object.keys(INITIAL_STATE).every(k => INITIAL_STATE[k] === state[k]);

export default class Balance extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.wallet && nextProps.wallet.id !== prevState.prevId) {
      return {
        ...INITIAL_STATE,
        prevId: nextProps.wallet.id,
      };
    }
    return null;
  }

  state = { ...INITIAL_STATE };

  componentDidMount() {
    this.check();
  }

  componentDidUpdate() {
    if (stateIsInitial(this.state)) {
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
    const { wallet } = this.props
    if (!wallet) {
      return
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
      const res = await fetch(
        `${SHAPESHIFT_MARKETINFO}${symbolCased}_${BITCOIN_SYMBOL_LOWER_CASED}`,
      );
      const { rate } = await res.json();
      toBTC = rate;
    }
    const res = await fetch(BTC_TO_USD);
    const { last: toUSD } = await res.json();
    const balanceCurrency = balance * toBTC * toUSD;
    this.setState({ balanceCurrency, loadingCurrency: false });
  };
}
