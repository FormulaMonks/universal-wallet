import React, { Component, Fragment, Children, cloneElement } from 'react';
import {
  broadcast,
  canBroadcast,
  placeOrder,
  validAddressSymbol,
  fetchMarketInfo,
} from '../../utils/ss';
import { propsChanged, validProps } from '../../utils/tx';

const INITIAL_STATE = {
  checking: false,
  valid: false,
  error: null,
  txId: null,
  broadcasting: false,
  info: null,
};

const txValidProps = props =>
  validProps(props) && props.toSymbol !== props.fromSymbol;

export default class SsTx extends Component {
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
    const { valid, error, info, checking, broadcasting, txId } = this.state;
    const { children, ...rest } = this.props;
    const { toSymbol, fromSymbol, txError, txValid, txChecking } = rest;

    if (
      !txValid ||
      txError ||
      txChecking ||
      !fromSymbol ||
      !toSymbol ||
      toSymbol === fromSymbol
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
            txBroadcast: this.placeOrder,
            txBroadcasting: broadcasting,
            txValid: valid,
            txError: error,
            txChecking: checking,
            txInfo: info,
            txId: txId,
          }),
        )}
      </Fragment>
    );
  }

  // shapeshift flow:
  // 1- place order: placeOrder
  // 2- render order details: renderOrderInfo
  //  2.1- if order cannot be broadcasted render details to manually do so
  // 3- if order can be broadcasted do so: broadcastOrder
  placeOrder = async () => {
    this.setState({ broadcasting: 'Placing order with ShapeShift' });

    const { to, toSymbol, from, fromSymbol, amount } = this.props;
    const opts = {
      depositAmount: amount,
      withdrawal: to,
      pair: `${fromSymbol}_${toSymbol}`,
      returnAddress: from,
    };

    try {
      const ssOrder = await placeOrder(opts);
      this.renderOrderInfo(ssOrder);
    } catch (e) {
      console.error('-- Could not place shapeshift order error: ', e);
      this.setState({
        error: 'Could not place order with shapeshift',
        broadcasting: 'Incomplete',
      });
    }
  };

  renderOrderInfo = async ({
    orderId,
    deposit,
    expiration,
    withdrawalAmount,
    quotedRate,
    pair,
    minerFee,
  }) => {
    const { from, fromSymbol, toSymbol, privateKey, amount } = this.props;

    const date = new Date(expiration);
    const info = [
      { label: 'Pair', value: pair },
      { label: 'Quoted rate', value: quotedRate },
      { label: 'Miner Fee', value: `${fromSymbol.toUpperCase()} ${minerFee}` },
      {
        label: 'Amount to receive',
        value: `${toSymbol.toUpperCase()} ${withdrawalAmount}`,
      },
      { label: 'Order Id', value: orderId },
      { label: 'ShapeShift address', value: deposit },
    ];
    this.setState({ info });
    const manually = `To complete transaction you need to send ${fromSymbol} ${amount} to ShapeShift address manually (expires today ${date.toLocaleTimeString()})`;

    if (canBroadcast(fromSymbol)) {
      this.broadcastOrder({
        to: deposit,
        from,
        privateKey,
        amount,
        fromSymbol,
        manually,
      });
    } else {
      this.setState({
        error: manually,
        broadcasting: 'Incomplete',
      });
    }
  };

  broadcastOrder = async ({
    to,
    from,
    fromSymbol,
    privateKey,
    amount,
    manually,
  }) => {
    this.setState({ broadcasting: 'Broadcasting transaction' });
    try {
      const txId = await broadcast({
        fromSymbol,
        to,
        from,
        privateKey,
        amount,
      });
      this.setState({ txId, broadcasting: 'Completed' });
    } catch (e) {
      console.error('-- Could not broadcast transaction error:  ', e);
      this.setState({
        error: manually,
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

  async validAddressFromSymbol(address, symbol) {
    this.setState({ checking: 'Validating withdrawal address' });
    const { isvalid, error } = await validAddressSymbol(address, symbol);
    if (!isvalid) {
      console.error('-- Withdrawal address error: ', error);
      this.setState({
        error: 'Wallet info doesn’t have valid address',
      });
      return false;
    }
    return true;
  }

  async validAddressToSymbol(address, symbol) {
    this.setState({ checking: 'Validating deposit address' });
    const { isvalid, error } = await validAddressSymbol(address, symbol);
    if (!isvalid) {
      console.error('-- Deposit address error: ', error);
      this.setState({ error: 'Deposit info isn’t valid address' });
      return false;
    }
    return true;
  }

  validate = async () => {
    this.setState({ ...INITIAL_STATE, checking: <div>Performing checks</div> });
    const { to, toSymbol, from, fromSymbol, amount } = this.props;
    if (
      (await this.validAddressToSymbol(to, toSymbol)) &&
      (await this.validAddressFromSymbol(from, fromSymbol))
    ) {
      try {
        const { pair, rate, minerFee, limit, minimum } = await fetchMarketInfo(
          fromSymbol,
          toSymbol,
        );
        const info = [
          { label: 'Pair', value: pair },
          { label: 'Rate', value: rate },
          {
            label: 'Miner Fee',
            value: `${fromSymbol.toUpperCase()} ${minerFee}`,
          },
          { label: 'Limit', value: `${fromSymbol.toUpperCase()} ${limit}` },
          { label: 'Minimum', value: `${fromSymbol.toUpperCase()} ${minimum}` },
          {
            label: 'Amount to receive',
            value: `${toSymbol.toUpperCase()} ${amount * rate}`,
          },
        ];
        this.setState({ info, valid: true, checking: 'Tx can take place' });
        return;
      } catch (e) {
        console.error('Could not fetch transaction info error: ', e);
        this.setState({ error: 'Could not fetch transaction info' });
      }
    }
    this.setState({ checking: 'Please review errors' });
  };
}
