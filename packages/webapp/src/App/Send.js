import React, { Component, Fragment } from 'react';
import { Header } from '../components';
import {
  CoinsStore,
  WalletsStore,
  BalanceStore,
  ContactsStore,
  BtcTxStore,
} from '../stores';
import { BITCOIN_SYMBOL_LOWER_CASED } from '../utils/constants';

const BtcTx = ({
  btcTxId,
  btcTxBroadcast,
  btcTxBroadcasting,
  btcTxValid,
  btcTxError,
  btcTxChecking,
  btcTxFee,
}) => {
  return (
    <Fragment>
      {btcTxError}
      {btcTxChecking && <div>Performing checks</div>}
      {btcTxFee && <div>Fee: {btcTxFee}</div>}
      {!btcTxId &&
        btcTxValid &&
        (btcTxBroadcasting ? (
          <Fragment>
            <div>Transaction taking place</div>
          </Fragment>
        ) : (
          <Fragment>
            <div>Tx can take place</div>
            <button onClick={btcTxBroadcast}>Send Tx</button>
          </Fragment>
        ))}
      {btcTxId && <div>Transaction id: {btcTxId}</div>}
    </Fragment>
  );
};

class Send extends Component {
  state = { to: '', from: null, amount: null };

  render() {
    const {
      balance,
      balanceHas,
      balanceLoading,
      balanceError,
      coinsError,
      coinsLoading,
      contacts,
      contactsError,
      contactsLoading,
      wallet,
      wallets,
      walletsError,
      walletsLoading,
    } = this.props;
    const { to, from, amount } = this.state;
    const contactsToBtc = contacts.filter(
      ({ symbol }) =>
        symbol && symbol.toLowerCase() === BITCOIN_SYMBOL_LOWER_CASED,
    );
    const walletsToBtc = wallets.filter(
      ({ symbol }) =>
        symbol && symbol.toLowerCase() === BITCOIN_SYMBOL_LOWER_CASED,
    );

    return (
      <Fragment>
        {coinsError}
        {walletsError}
        {balanceError}
        {contactsError}
        {coinsLoading || walletsLoading || contactsLoading ? (
          <div>loading</div>
        ) : (
          <Fragment>
            <input
              type="text"
              name="to"
              placeholder="to"
              value={to}
              onBlur={this.onInputToBlur}
            />
            <select
              defaultValue=""
              onChange={this.onSelectToChange}
            >
              <option key="send-to-label" disabled value="" hidden>
                Contacts & My Wallets
              </option>
              {contactsToBtc.length && (
                <optgroup key="send-to-contacts" label="Contacts">
                  {contactsToBtc.map(({ id, alias }) => (
                    <option
                      key={`send-to-contact-${id}`}
                      value={`contact-${id}`}
                    >
                      {alias}
                    </option>
                  ))}
                </optgroup>
              )}
              {walletsToBtc.length && (
                <optgroup key="send-to-my-wallets" label="My Wallets">
                  {walletsToBtc.map(({ id, alias }) => (
                    <option
                      key={`send-to-my-wallets-${id}`}
                      value={`wallet-${id}`}
                    >
                      {alias}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <input
              type="text"
              name="amount"
              placeholder="amount"
              onBlur={this.onInputAmountBlur}
            />
            {walletsToBtc.length ? (
              <select defaultValue="" onChange={this.onSelectFromChange}>
                <option key="send-from-label" disabled value="" hidden>
                  My Wallets
                </option>
                {walletsToBtc.map(({ id, alias }) => (
                  <option key={`send-from-${id}`} value={id}>
                    {alias}
                  </option>
                ))}
              </select>
            ) : (
              <div>You neet to add at least one BTC wallet</div>
            )}
            {balanceHas && (
              <Fragment>
                {balanceLoading ? (
                  <div>loading</div>
                ) : (
                  <Fragment>
                    <div>Balance: {balance}</div>
                    <BtcTxStore
                      to={to}
                      from={from}
                      amount={amount}
                      balance={balance}
                      privateKey={wallet.privateKey}
                    >
                      <BtcTx />
                    </BtcTxStore>
                  </Fragment>
                )}
              </Fragment>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }

  onInputAmountBlur = e => {
    this.setState({ amount: parseFloat(e.currentTarget.value) });
  };

  onInputToBlur = e => {
    this.setState({ to: e.currentTarget.value });
  };

  onSelectFromChange = e => {
    const walletId = e.currentTarget.value;
    this.props.walletPick(walletId);
    const { publicAddress: from } = this.props.wallets.find(
      ({ id }) => id === walletId,
    );
    this.setState({ from });
  };

  onSelectToChange = e => {
    const value = e.currentTarget.value;
    let list = this.props.wallets;
    let prefix = 'wallet-';
    if (value.includes('contact-')) {
      prefix = 'contact-';
      list = this.props.contacts;
    }
    const { publicAddress: to } = list.find(
      ({ id }) => `${prefix}${id}` === value,
    );
    this.setState({ to });
  };
}

export default () => (
  <Fragment>
    <Header />
    <ContactsStore>
      <CoinsStore>
        <WalletsStore>
          <BalanceStore>
            <Send />
          </BalanceStore>
        </WalletsStore>
      </CoinsStore>
    </ContactsStore>
  </Fragment>
);
