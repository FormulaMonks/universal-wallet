import React, { Component, Fragment, Children, cloneElement } from 'react';
import {
  broadcast,
  postTx,
  validAddressSymbol,
  fetchMarketInfo,
} from '../utils/ssTx';

const INITIAL_STATE = {
  checking: false,
  valid: false,
  error: null,
  txId: null,
  broadcasting: false,
  info: null,
};

export default class ShapeShift extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    this.validate();
  }

  componentDidUpdate(prevProps) {
    const {
      to,
      toSymbol,
      from,
      fromSymbol,
      amount,
      balance,
      privateKey,
    } = this.props;
    if (
      to &&
      toSymbol &&
      from &&
      fromSymbol &&
      amount &&
      balance &&
      privateKey &&
      (to !== prevProps.to ||
        toSymbol !== prevProps.toSymbol ||
        from !== prevProps.from ||
        fromSymbol !== prevProps.fromSymbol ||
        amount !== prevProps.amount ||
        balance !== prevProps.balance ||
        privateKey !== prevProps.privateKey)
    ) {
      this.validate();
    }
  }

  render() {
    const { valid, error, info, checking, broadcasting, txId } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ssTxBroadcast: this.broadcast,
            ssTxBroadcasting: broadcasting,
            ssTxValid: valid,
            ssTxError: error,
            ssTxChecking: checking,
            ssTxInfo: info,
            ssTxId: txId,
            ...rest,
          }),
        )}
      </Fragment>
    );
  }

  async getDepositAddress(opts) {
    try {
      const { deposit, ...rest } = await postTx(opts);
      console.log('getDepositAddress: ', rest)
      return deposit;
    } catch (e) {
      console.log('caught error: ', e, JSON.stringify(e))
      this.setState({
        error: (
          <div>
            The operation did not take place, there was an error:{' '}
            {JSON.stringify(e)}
          </div>
        ),
      });
    }
    return null;
  }

  broadcast = async () => {
    this.setState({ broadcasting: true });

    const { to, toSymbol, from, fromSymbol, amount, privateKey } = this.props;
    const opts = {
      depositAmount: amount,
      withdrawal: to,
      pair: `${fromSymbol.toLowerCase()}_${toSymbol.toLowerCase()}`,
      returnAddress: from,
    };

    try {
      const to = await this.getDepositAddress(opts);
      if (to) {
        const txId = await broadcast({ to, from, privateKey, amount });
        this.setState({ txId });
      }
    } catch (e) {
      this.setState({ error: <div>{JSON.stringify(e)}</div> });
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

  async validAddressFromSymbol(address, symbol) {
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
    this.setState({ ...INITIAL_STATE, checking: true });
    const {
      to,
      toSymbol,
      from,
      fromSymbol,
      amount,
      balance,
    } = this.props;
    if (
      this.validDiffAddresses(to, from) &&
      this.validAmount(amount) &&
      this.validAmounBalance(amount, balance) &&
      await this.validAddressToSymbol(to, toSymbol) &&
      await this.validAddressFromSymbol(from, fromSymbol)
    ) {
      try {
        const info = await fetchMarketInfo(fromSymbol, toSymbol);
        this.setState({ info, valid: true });
      } catch (e) {
        this.setState({ error: <div>JSON.stringify(e)</div> });
      }
    }
    this.setState({ checking: false });
  };
}
