import React, { Component, Fragment } from 'react';
import {
  CoinsStore,
  ContactsStore,
  WalletsStore,
  BalanceStore,
  ShapeShiftTxStore,
} from '../stores';
import { Header } from '../components';

const ShapeShiftTx = props => {
  const {
    ssTxId,
    ssTxBroadcast,
    ssTxBroadcasting,
    ssTxValid,
    ssTxError,
    ssTxChecking,
    ssTxInfo,
  } = props;
  return (
    <Fragment>
      {ssTxError}
      {ssTxChecking && <div>Performing checks</div>}
      {ssTxInfo && (
        <Fragment>
          <div>Rate: {ssTxInfo.rate}</div>
          <div>Limit: {ssTxInfo.limit}</div>
          <div>Min: {ssTxInfo.minimum}</div>
          <div>Fee: {ssTxInfo.minerFee}</div>
        </Fragment>
      )}
      {!ssTxId &&
        ssTxValid &&
        (ssTxBroadcasting ? (
          <Fragment>
            <div>Transaction taking place</div>
          </Fragment>
        ) : (
          <Fragment>
            <div>Tx can take place</div>
            <button onClick={ssTxBroadcast}>Send Tx</button>
          </Fragment>
        ))}
      {ssTxId && <div>Transaction id: {ssTxId}</div>}
    </Fragment>
  );
};

class Exchange extends Component {
  state = { to: '', toSymbol: '', amount: null };

  render() {
    const {
      coins,
      coinsLoading,
      coinsError,
      balance,
      balanceLoading,
      balanceHas,
      balanceError,
      wallet,
      wallets,
      walletsLoading,
      walletsError,
      contacts,
      contactsLoading,
      contactsError,
    } = this.props;
    const { to, toSymbol, amount } = this.state;

    return (
      <Fragment>
        {walletsError}
        {contactsError}
        {balanceError}
        {coinsError}
        {coinsLoading || walletsLoading || contactsLoading ? (
          <div>loading</div>
        ) : (
          <Fragment>
            <div>From:</div>
            <div>
              {wallets.length ? (
                <select defaultValue="" onChange={this.onSelectFromChange}>
                  <option key="send-from-label" disabled value="" hidden>
                    My Wallets
                  </option>
                  {wallets.map(({ id, alias }) => (
                    <option key={`send-from-${id}`} value={id}>
                      {alias}
                    </option>
                  ))}
                </select>
              ) : (
                <div>You neet to add at least one wallet</div>
              )}
              {balanceHas && (
                <Fragment>
                  {balanceLoading ? (
                    <div>loading</div>
                  ) : (
                    <div>Balance: {balance}</div>
                  )}
                </Fragment>
              )}
            </div>
            <div>To:</div>
            <div>
              <input
                type="text"
                placeholder="To Public Address"
                value={to}
                onBlur={this.onInputToBlur}
              />
              <select value={toSymbol} onChange={this.onSelectToSymbolChange}>
                <option key="send-to-symbol" disabled hidden value="">
                  Coins
                </option>
                {coins.map(({ name, symbol }) => {
                  return (
                    <option key={`to-symbol-${symbol}`} value={symbol}>
                      {name} ({symbol})
                    </option>
                  );
                })}
              </select>
              <select defaultValue="" onChange={this.onSelectToChange}>
                <option key="send-to-label" disabled value="" hidden>
                  Contacts & My Wallets
                </option>
                {contacts.length && (
                  <optgroup key="send-to-contacts" label="Contacts">
                    {contacts.map(({ id, alias }) => (
                      <option
                        key={`send-to-contact-${id}`}
                        value={`contact-${id}`}
                      >
                        {alias}
                      </option>
                    ))}
                  </optgroup>
                )}
                {wallets.length && (
                  <optgroup key="send-to-my-wallets" label="My Wallets">
                    {wallets.map(({ id, alias }) => (
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
            </div>
            <div>
              <input
                type="text"
                placeholder="Amount"
                onBlur={this.onInputAmountBlur}
              />
            </div>
            {wallet &&
              balanceHas &&
              to && (
                <div>
                  <ShapeShiftTxStore
                    to={to}
                    toSymbol={toSymbol}
                    from={wallet.publicAddress}
                    fromSymbol={wallet.symbol}
                    amount={amount}
                    balance={balance}
                    privateKey={wallet.privateKey}
                  >
                    <ShapeShiftTx />
                  </ShapeShiftTxStore>
                </div>
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
    this.props.walletPick(e.currentTarget.value);
  };

  onSelectToChange = e => {
    const value = e.currentTarget.value;
    let list = this.props.wallets;
    let prefix = 'wallet-';
    if (value.includes('contact-')) {
      prefix = 'contact-';
      list = this.props.contacts;
    }
    const { publicAddress: to, symbol: toSymbol } = list.find(
      ({ id }) => `${prefix}${id}` === value,
    );
    this.setState({ to, toSymbol });
  };

  onSelectToSymbolChange = e => {
    this.setState({ toSymbol: e.currentTarget.value });
  };
}

export default () => (
  <Fragment>
    <Header />
    <CoinsStore>
      <ContactsStore>
        <WalletsStore>
          <BalanceStore>
            <Exchange />
          </BalanceStore>
        </WalletsStore>
      </ContactsStore>
    </CoinsStore>
  </Fragment>
);
