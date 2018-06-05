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
  validProps(props) &&
  props.toSymbol.toLowerCase() !== props.fromSymbol.toLowerCase();

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
      toSymbol.toLowerCase() === fromSymbol.toLowerCase()
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
    this.setState({ broadcasting: <div>Placing order with ShapeShift</div> });

    const { to, toSymbol, from, fromSymbol, amount } = this.props;
    const opts = {
      depositAmount: amount,
      withdrawal: to,
      pair: `${fromSymbol.toLowerCase()}_${toSymbol.toLowerCase()}`,
      returnAddress: from,
    };

    try {
      const ssOrder = await placeOrder(opts);
      this.renderOrderInfo(ssOrder);
    } catch (e) {
      this.setState({
        error: (
          <div>
            There was an error placing the order with ShapeShift:{' '}
            {e.toString ? e.toString() : JSON.stringify(e)}
          </div>
        ),
        broadcasting: <div>The transaction did not take place</div>,
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
    maxLimit,
  }) => {
    const { from, fromSymbol, privateKey, amount } = this.props;

    const date = new Date(expiration);
    const info = (
      <Fragment>
        <div>Pair: {pair}</div>
        <div>Quoted rate: {quotedRate}</div>
        <div>Miner Fee: {minerFee}</div>
        <div>Max Limit: {maxLimit}</div>
        <div>Amount to receive: {withdrawalAmount}</div>
        <div>Order Id: {orderId}</div>
      </Fragment>
    );
    this.setState({
      info,
      broadcasting: !canBroadcast(fromSymbol) && (
        <Fragment>
          <div>Cannot broadcast transaction, must be done manually:</div>
          <div>
            Send {amount} {fromSymbol} to {deposit} by {date.toLocaleString()}
          </div>
        </Fragment>
      ),
    });

    canBroadcast(fromSymbol) &&
      this.broadcastOrder({
        to: deposit,
        from,
        privateKey,
        amount,
        fromSymbol,
      });
  };

  broadcastOrder = async ({ to, from, fromSymbol, privateKey, amount }) => {
    this.setState({ broadcasting: <div>Broadcasting transaction</div> });
    try {
      const txId = await broadcast({
        fromSymbol,
        to,
        from,
        privateKey,
        amount,
      });
      this.setState({ txId, broadcasting: <div>Transaction broadcasted</div> });
    } catch (e) {
      this.setState({
        error: <div>{e.toString ? e.toString() : JSON.stringify(e)}</div>,
        broadcasting: <div>The transaction was not broadcasted</div>,
      });
    }
  };

  validAmountFeeBalance(amount, fee, balance) {
    this.setState({
      checking: <div>{'Validating Amount + Fee < Balance'}</div>,
    });
    if (amount + fee > balance) {
      this.setState({
        error: <div>Cannot send amount bigger than balance + fee</div>,
      });
      return false;
    }
    return true;
  }

  async validAddressFromSymbol(address, symbol) {
    this.setState({ checking: <div>Validating From address</div> });
    const { isvalid, error } = await validAddressSymbol(address, symbol);
    if (!isvalid) {
      this.setState({
        error: <div>From is not a valid address: {JSON.stringify(error)}</div>,
      });
      return false;
    }
    return true;
  }

  async validAddressToSymbol(address, symbol) {
    this.setState({ checking: <div>Validating To address</div> });
    const { isvalid, error } = await validAddressSymbol(address, symbol);
    if (!isvalid) {
      this.setState({
        error: <div>To is not a valid address: {JSON.stringify(error)}</div>,
      });
      return false;
    }
    return true;
  }

  validate = async () => {
    this.setState({ ...INITIAL_STATE, checking: <div>Performing checks</div> });
    const { to, toSymbol, from, fromSymbol } = this.props;
    if (
      (await this.validAddressToSymbol(to, toSymbol)) &&
      (await this.validAddressFromSymbol(from, fromSymbol))
    ) {
      try {
        const {
          pair,
          rate,
          minerFee,
          limit,
          minimum,
          maxLimit,
        } = await fetchMarketInfo(fromSymbol, toSymbol);
        const info = (
          <Fragment>
            <div>Pair: {pair}</div>
            <div>Rate: {rate}</div>
            <div>Miner Fee: {minerFee}</div>
            <div>Limit: {limit}</div>
            <div>Minimum: {minimum}</div>
            <div>Max Limit: {maxLimit}</div>
          </Fragment>
        );
        this.setState({ info, valid: true });
      } catch (e) {
        this.setState({ error: <div>JSON.stringify(e)</div> });
      }
    }
    this.setState({ checking: null });
  };
}
