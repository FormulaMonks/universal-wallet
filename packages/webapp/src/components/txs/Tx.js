import React, { Component, Fragment, Children, cloneElement } from 'react';

const INITIAL_STATE = {
  checking: false,
  error: null,
  valid: false,
};

export default class BtcTx extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    const { to, from, amount, balance, privateKey } = this.props;
    if (to && from && amount && balance && privateKey) {
      this.validate();
    }
  }

  componentDidUpdate(prevProps) {
    const { to, from, amount, balance, privateKey } = this.props;
    if (
      to &&
      from &&
      amount &&
      balance &&
      privateKey &&
      (to !== prevProps.to ||
        from !== prevProps.from ||
        amount !== prevProps.amount ||
        balance !== prevProps.balance ||
        privateKey !== prevProps.privateKey)
    ) {
      this.validate();
    }
  }

  render() {
    const { valid, error, checking } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            txChecking: checking,
            txError: error,
            txValid: valid,
          }),
        )}
      </Fragment>
    );
  }

  validDiffAddresses(address1, address2, symbol1, symbol2) {
    if (address1 === address2 && symbol1 === symbol2) {
      this.setState({ error: 'Please choose a different deposit address' });
      return false;
    }
    return true;
  }

  validAmount(amount) {
    if (!(amount > 0) || isNaN(amount)) {
      this.setState({ error: 'Amount should be a number greater than zero' });
      return false;
    }
    return true;
  }

  validAmounBalance(amount, balance) {
    if (amount > balance) {
      this.setState({ error: 'Amount exceeds balance' });
      return false;
    }
    return true;
  }

  validate = async () => {
    this.setState({ ...INITIAL_STATE, checking: <div>Performing checks</div> });
    const { to, toSymbol, from, fromSymbol, amount, balance } = this.props;
    if (
      this.validDiffAddresses(to, from, toSymbol, fromSymbol) &&
      this.validAmount(amount) &&
      this.validAmounBalance(amount, balance)
    ) {
      this.setState({ valid: true, checking: null });
      return;
    }
    this.setState({ checking: 'Please review errors' });
  };
}
