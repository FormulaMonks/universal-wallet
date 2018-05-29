import React, { Component, Fragment, Children, cloneElement } from 'react';
import {
  broadcast,
  canBroadcast,
  postTx,
  validAddressSymbol,
  fetchMarketInfo,
} from '../../utils/ssTx';
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
            txBroadcast: this.broadcast,
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

  async getDepositInfo(opts) {
    try {
      return await postTx(opts);
    } catch (e) {
      this.setState({
        error: (
          <div>
            The operation did not take place, there was an error:{' '}
            {e.toString ? e.toString() : JSON.stringify(e)}
          </div>
        ),
      });
    }
    return null;
  }

  broadcast = async () => {
    this.setState({ broadcasting: <div>Sending order to ShapeShift</div> });

    const { to, toSymbol, from, fromSymbol, amount, privateKey } = this.props;
    const opts = {
      depositAmount: amount,
      withdrawal: to,
      pair: `${fromSymbol.toLowerCase()}_${toSymbol.toLowerCase()}`,
      returnAddress: from,
    };

    try {
      const {
        orderId,
        deposit,
        expiration,
        withdrawalAmount,
        quotedRate,
        pair,
        minerFee,
        maxLimit,
      } = await this.getDepositInfo(opts);
      const date = new Date(expiration);
      const info = (
        <Fragment>
          <div>Order Id: {orderId}</div>
          <div>Pair: {pair}</div>
          <div>Miner Fee: {minerFee}</div>
          <div>Max Limit: {maxLimit}</div>
          <div>Amount to receive: {withdrawalAmount}</div>
          <div>Quoted rate: {quotedRate}</div>
        </Fragment>
      );
      this.setState({ info });
      if (canBroadcast(fromSymbol)) {
        this.setState({ broadcasting: <div>Broadcasting transaction</div> });
        const txId = await broadcast({ to: deposit, from, privateKey, amount });
        this.setState({ txId, broadcasting: null });
      } else {
        this.setState({
          broadcasting: (
            <Fragment>
              <div>Cannot broadcast transaction, must be done manually.</div>
              <div>
                Send {amount} {fromSymbol} to {deposit} by {date.toLocaleString()}
              </div>
            </Fragment>
          ),
        });
      }
    } catch (e) {
      this.setState({
        error: (
          <div>
            There was an error: {e.toString ? e.toString() : JSON.stringify(e)}
          </div>
        ),
        broadcasting: (
          <div>The transaction to ShapeShift was not broadcasted</div>
        ),
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
