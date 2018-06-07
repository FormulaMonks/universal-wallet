import React, { Component, Fragment, Children, cloneElement } from 'react';
import {
  ETHER_SYMBOL_LOWER_CASED,
  broadcast,
  validateAddress,
  generateTx,
  getTxInfo,
} from '../../utils/eth';
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
  toSymbol.toLowerCase() === ETHER_SYMBOL_LOWER_CASED &&
  fromSymbol.toLowerCase() === ETHER_SYMBOL_LOWER_CASED;

const txValidProps = props => validProps(props) && validSymbols(props);

export default class EthTx extends Component {
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
      const txId = await broadcast(this.props);
      this.setState({ txId, broadcasting: 'Completed' });
    } catch (e) {
      console.error('-- Could not broadcast transaction error:  ', e);
      this.setState({
        error: 'The transaction was not broadcasted',
        broadcasting: 'Unsuccessful',
      });
    }
  };

  validAddresses(to, from) {
    this.setState({ checking: 'Validating deposit address' });
    if (!validateAddress(to)) {
      this.setState({
        error: 'Deposit info isn’t valid ethereum address',
      });
      return false;
    }
    this.setState({ checking: 'Validating withdrawal address' });
    if (!validateAddress(from)) {
      this.setState({
        error: 'Wallet info doesn’t have valid ethereum address',
      });
      return false;
    }
    return true;
  }

  validate = async () => {
    this.setState({ ...INITIAL_STATE, checking: <div>Performing checks</div> });
    const { to, from, amount, privateKey } = this.props;
    if (this.validAddresses(to, from)) {
      try {
        const { ether, wei, gwei } = await getTxInfo();
        await generateTx({ to, from, privateKey, amount });
        this.setState({
          info: [
            { label: 'Gas price', value: `${gwei.price} gwei` },
            { label: 'Gas limit', value: `${wei.limit} wei` },
            { label: 'Estimated fee', value: `${ether.aproxFee} ether` },
          ],
          valid: true,
          checking: 'Tx can take place',
        });
        return;
      } catch (e) {
        console.error('Could not fetch transaction info error: ', e);
        this.setState({ error: 'Could not fetch transaction info' });
      }
    }
    this.setState({ checking: 'Please review errors' });
  };
}
