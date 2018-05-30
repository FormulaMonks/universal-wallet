import React, { Component, Fragment, Children, cloneElement } from 'react';
import {
  broadcast,
  validateAddress,
  generateTx,
  getTxInfo,
} from '../../utils/ethTx';
import { ETHER_SYMBOL_LOWER_CASED } from '../../utils/constants';
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

  validAddresses(to, from) {
    this.setState({ checking: <div>Validating To address</div> });
    if (!validateAddress(to)) {
      this.setState({ error: <div>To is not a valid ethereum address</div> });
      return false;
    }
    this.setState({ checking: <div>Validating From address</div> });
    if (!validateAddress(from)) {
      this.setState({ error: <div>From is not a valid ethereum address</div> });
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
          info: (
            <Fragment>
              <div>Gas price: {gwei.price} gwei</div>
              <div>Gas limit: {wei.limit} wei</div>
              <div>Approximate fee: {ether.aproxFee} ether</div>
            </Fragment>
          ),
          valid: true,
        });
      } catch (e) {
        this.setState({
          error: <div>{e.toString ? e.toString() : JSON.stringify(e)}</div>,
        });
      }
    }
    this.setState({ checking: null });
  };
}
