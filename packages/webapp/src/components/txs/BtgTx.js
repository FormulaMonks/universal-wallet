import React, { Component, Fragment, Children, cloneElement } from 'react';
import { SYMBOL, _broadcast, fetchFee, validateAddress } from '../../utils/btg';
import { propsChanged, validProps } from '../../utils/tx';

const INITIAL_STATE = {
  broadcasting: false,
  checking: false,
  error: null,
  info: [],
  txId: null,
  valid: false,
};

const validSymbols = ({ toSymbol, fromSymbol }) =>
  toSymbol === SYMBOL && fromSymbol === SYMBOL;

const txValidProps = props => validProps(props) && validSymbols(props);

export default class BtgTx extends Component {
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

    if (!txValid || txError || txChecking || !txValidProps(this.props)) {
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
    this.setState({ broadcasting: 'In progress' });
    try {
      const txId = await _broadcast(this.props);
      this.setState({ txId, broadcasting: 'Completed' });
    } catch (e) {
      console.error('-- Could not broadcast transaction error:  ', e);
      this.setState({
        error: 'The transaction was not broadcasted',
        broadcasting: 'Unsuccessful',
      });
    }
  };

  validAmountFeeBalance(amount, fee, balance) {
    this.setState({ checking: 'Validating Amount + Fee < Balance' });
    if (amount + fee > balance) {
      this.setState({ error: 'Amount + fee exceeds balance' });
      return false;
    }
    return true;
  }

  validAddresses(to, from) {
    this.setState({ checking: 'Validating deposit address' });
    if (!validateAddress(to)) {
      this.setState({
        error: 'Deposit info isn’t valid bitcoin gold address',
      });
      return false;
    }
    this.setState({ checking: 'Validating withdrawal address' });
    if (!validateAddress(from)) {
      this.setState({
        error: 'Wallet info doesn’t have valid bitcoin gold address',
      });
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
        if (this.validAmountFeeBalance(amount, fee, balance)) {
          this.setState({
            info: [{ label: 'Fee', value: fee }],
            valid: true,
            checking: 'Tx can take place',
          });
          return;
        }
      } catch (e) {
        console.error('Could not fetch transaction fee error: ', e);
        this.setState({ error: 'Could not fetch transaction fee' });
      }
    }
    this.setState({ checking: 'Please review errors' });
  };
}
