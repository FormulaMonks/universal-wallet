import React, { Component, Fragment, Children, cloneElement } from 'react';
import bitcore from 'bitcore-lib';
import { Insight } from 'bitcore-explorers';

const { Address } = bitcore;
const insight = new Insight('testnet');
const toSatoshi = btc => btc * 100000000;
const toBTC = satoshi => satoshi / 100000000;
const INITIAL_STATE = {
  checking: true,
  check: false,
  checkError: null,
  fee: null,
};

export default class BtcTx extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    this.goCheck();
  }

  componentDidUpdate(prevProps) {
    const { to, from, amount, balance, privateKey } = this.props;
    if (
      to &&
      from &&
      this.props.hasOwnProperty('amount') &&
      balance &&
      privateKey &&
      (to !== prevProps.to ||
        from !== prevProps.from ||
        amount !== prevProps.amount ||
        balance !== prevProps.balance ||
        privateKey !== prevProps.privateKey)
    ) {
      this.goCheck();
    }
  }

  render() {
    const { check, checkError, checking, fee, broadcasting, txId } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            btcTxBroadcast: this.broadcast,
            btcTxBroadcasting: broadcasting,
            btcTxCheck: check,
            btcTxCheckError: checkError,
            btcTxChecking: checking,
            btcTxFee: fee,
            btcTxId: txId,
            ...rest,
          }),
        )}
      </Fragment>
    );
  }

  broadcast = async () => {
    this.setState({ broadcasting: true });

    const { to, from, amount, privateKey } = this.props;

    // get min fee and look for min amount
    const fromAddress = Address.fromString(from);
    const toAddress = Address.fromString(to);
    let txId;
    try {
      txId = await new Promise(r => {
        insight.getUnspentUtxos(fromAddress, (err, utxos) => {
          if (err) {
            throw err;
          }
          const tx = bitcore.Transaction();
          tx.from(utxos);
          tx.to(toAddress, toSatoshi(amount));
          tx.change(fromAddress);
          tx.sign(privateKey);
          tx.serialize();
          insight.broadcast(tx.toString(), (err, txId) => {
            if (err) {
              console.log('err in broadcast: ', err);
            }
            console.log('Transaction Id: ', JSON.stringify(txId, null, 2));
            r(txId);
          });
        });
      });
      this.setState({ txId });
    } catch (e) {
      this.setState({
        check: false,
        checking: false,
        broadcasting: false,
        checkError: <div>JSON.stringify(e)</div>,
      });
      return;
    }

    this.setState({ broadcasting: false });
  };

  goCheck = async () => {
    this.setState({ ...INITIAL_STATE, checking: true });

    const { to, from, amount, balance, privateKey } = this.props;
    if (!to || !from || !amount || !balance || !privateKey) {
      this.setState({ check: false, checkError: null, checking: false });
      return;
    }

    if (from === to) {
      this.setState({
        check: false,
        checking: false,
        checkError: <div>Cannot perform Tx from wallet to same wallet</div>,
      });
      return;
    }

    if (!(amount > 0)) {
      this.setState({
        check: false,
        checking: false,
        checkError: <div>Amount should be a number bigger than 0</div>,
      });
      return;
    }

    if (amount >= balance) {
      this.setState({
        check: false,
        checking: false,
        checkError: <div>Cannot send amount equal or bigger than balance</div>,
      });
      return;
    }

    // valid addresses?
    if (!Address.isValid(to)) {
      this.setState({
        check: false,
        checking: false,
        checkError: <div>To is not a valid bitcoin address</div>,
      });
      return;
    }
    if (!Address.isValid(from)) {
      this.setState({
        check: false,
        checking: false,
        checkError: <div>From is not a valid bitcoin address</div>,
      });
      return;
    }

    // get min fee and look for min amount
    const fromAddress = Address.fromString(from);
    const toAddress = Address.fromString(to);
    let fee;
    try {
      fee = await new Promise(r => {
        insight.getUnspentUtxos(fromAddress, (err, utxos) => {
          if (err) {
            throw err;
          }
          const tx = bitcore.Transaction();
          tx.from(utxos);
          tx.to(toAddress, toSatoshi(amount));
          tx.change(fromAddress);
          tx.sign(privateKey);
          tx.serialize();
          //console.log(JSON.stringify(tx.toObject(), null, 2));
          const { inputs, outputs } = tx.toObject();
          const totalInputs = inputs.reduce((p, c) => p + c.output.satoshis, 0);
          const totalOutputs = outputs.reduce((p, c) => p + c.satoshis, 0);
          const fee = totalInputs - totalOutputs;
          r(toBTC(fee));
        });
      });
      this.setState({ fee });
    } catch (e) {
      this.setState({
        check: false,
        checking: false,
        checkError: <div>JSON.stringify(e)</div>,
      });
      return;
    }
    if (amount + fee > balance) {
      this.setState({
        check: false,
        checking: false,
        checkError: <div>Cannot send amount bigger than balance + fee</div>,
      });
      return;
    }

    this.setState({ check: true, checking: false, checkError: null });
  };
}
