import React, { Component, Fragment, Children, cloneElement } from 'react';
import { broadcast, fetchFee, validateAddress, BLACKCOIN_SYMBOL_LOWER_CASED } from '../../utils/blk';
import { propsChanged, validProps } from '../../utils/tx';

const INITIAL_STATE = {
  broadcasting: false,
  checking: false,
  error: null,
  info: null,
  txId: null,
  valid: false,
};

const validSymbols = ({ toSymbol, fromSymbol }) =>
  toSymbol.toLowerCase() === BLACKCOIN_SYMBOL_LOWER_CASED &&
  fromSymbol.toLowerCase() === BLACKCOIN_SYMBOL_LOWER_CASED;

const txValidProps = props => validProps(props) && validSymbols(props);

export default class BtcTx extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    txValidProps(this.props) && this.validate();
  }

  componentDidUpdate(prevProps) {
    propsChanged(this.props, prevProps) &&
      txValidProps(this.props) &&
      this.validate();
  }

  render() {
    const { valid, error, checking, info, broadcasting, txId } = this.state;
    const { children, ...rest } = this.props;
    const { txError, txValid, txChecking } = rest;

    if (
      !txValid ||
      txError ||
      txChecking ||
      !txValidProps(this.props)
    ) {
      return (
        <Fragment>
          {Children.map(children, child => cloneElement(child, { ...rest }))}
        </Fragment>
      );
    }

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            txBroadcast: this.broadcast,
            txBroadcasting: broadcasting,
            txChecking: checking,
            txError: error,
            txInfo: info,
            txId: txId,
            txValid: valid,
          }),
        )}
      </Fragment>
    );
  }

  broadcast = async () => {
    this.setState({ broadcasting: <div>Broadcasting transaction</div> });
    try {
      const txId = await broadcast(this.props);
      this.setState({ txId, broadcasting: <div>Transaction broadcasted</div> });
    } catch (e) {
      this.setState({
        error: <div>{e.toString ? e.toString() : JSON.stringify(e)}</div>,
        broadcasting: <div>The transaction was not broadcasted</div>,
      });
    }
  };

  validAmountFeeBalance(amount, fee, balance) {
    this.setState({ checking: <div>{'Validating Amount + Fee < Balance'}</div> });
    if (amount + fee > balance) {
      this.setState({
        error: <div>Cannot send amount bigger than balance + fee</div>,
      });
      return false;
    }
    return true;
  }

  validAddresses(to, from) {
    this.setState({ checking: <div>Validating To address</div> });
    if (!validateAddress(to)) {
      this.setState({ error: <div>To is not a valid blackcoin address</div> });
      return false;
    }
    this.setState({ checking: <div>Validating From address</div> });
    if (!validateAddress(from)) {
      this.setState({ error: <div>From is not a valid blackcoin address</div> });
      return false;
    }
    return true;
  }

  validate = async () => {
    this.setState({ ...INITIAL_STATE, checking: <div>Performing checks</div> });
    const { to, from, amount, balance, privateKey } = this.props;
    if (this.validAddresses(to, from)) {
      try {
        const fee = await fetchFee({ to, from, privateKey, amount });
        const valid = this.validAmountFeeBalance(amount, fee, balance);
        this.setState({ info: <div>Fee: {fee}</div>, valid });
      } catch (e) {
        this.setState({
          error: <div>{e.toString ? e.toString() : JSON.stringify(e)}</div>,
        });
      }
    }
    this.setState({ checking: null });
  };
}
