import React, { Component, Fragment, Children, cloneElement } from 'react';
import { broadcast, fetchFee, validateAddress } from '../utils/btcTx';

const INITIAL_STATE = {
  broadcasting: false,
  checking: false,
  error: null,
  fee: null,
  txId: null,
  valid: false,
};

export default class BtcTx extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    this.validate();
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
    const { valid, error, checking, fee, broadcasting, txId } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            btcTxBroadcast: this.broadcast,
            btcTxBroadcasting: broadcasting,
            btcTxChecking: checking,
            btcTxError: error,
            btcTxFee: fee,
            btcTxId: txId,
            btcTxValid: valid,
            ...rest,
          }),
        )}
      </Fragment>
    );
  }

  broadcast = async () => {
    this.setState({ broadcasting: true });
    try {
      const txId = await broadcast(this.props);
      this.setState({ txId });
    } catch (e) {
      this.setState({ error: <div>JSON.stringify(e)</div> });
    }
    this.setState({ broadcasting: false });
  };

  validDiffAddresses(address1, address2) {
    if (address1 === address2) {
      this.setState({
        error: <div>Cannot perform Tx from wallet to same wallet</div>,
      });
      return false;
    }
    return true;
  }

  validAmount(amount) {
    if (!(amount > 0)) {
      this.setState({
        error: <div>Amount should be a number greater than 0</div>,
      });
      return false;
    }
    return true;
  }

  validAmounBalance(amount, balance) {
    if (amount >= balance) {
      this.setState({
        error: <div>Cannot send amount equal or bigger than balance</div>,
      });
      return false;
    }
    return true;
  }

  validAmountFeeBalance(amount, fee, balance) {
    if (amount + fee > balance) {
      this.setState({
        error: <div>Cannot send amount bigger than balance + fee</div>,
      });
      return false;
    }
    return true;
  }

  validAddresses(to, from) {
    if (!validateAddress(to)) {
      this.setState({ error: <div>To is not a valid bitcoin address</div> });
      return false;
    }
    if (!validateAddress(from)) {
      this.setState({ error: <div>From is not a valid bitcoin address</div> });
      return false;
    }
    return true;
  }

  validate = async () => {
    this.setState({ ...INITIAL_STATE, checking: true });
    const { to, from, amount, balance, privateKey } = this.props;
    if (
      this.validDiffAddresses(to, from) &&
      this.validAmount(amount) &&
      this.validAmounBalance(amount, balance) &&
      this.validAddresses(to, from)
    ) {
      try {
        const fee = await fetchFee({ to, from, privateKey, amount });
        const valid = this.validAmountFeeBalance(amount, fee, balance);
        this.setState({ fee, valid });
      } catch (e) {
        this.setState({ error: <div>JSON.stringify(e)</div> });
      }
    }
    this.setState({ checking: false });
  };
}
