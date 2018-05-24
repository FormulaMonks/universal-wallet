import React, { Component, Fragment } from 'react';
import { Header } from '../components';
import {
  CoinsStore,
  WalletsStore,
  BalanceStore,
  ContactsStore,
  TxStore,
} from '../stores';

const Tx = ({
  txId,
  txBroadcast,
  txBroadcasting,
  txValid,
  txError,
  txChecking,
  txInfo,
}) => {
  return (
    <Fragment>
      {txError}
      {txChecking && <div>Performing checks</div>}
      {txInfo}
      {!txId &&
        txValid &&
        (txBroadcasting ? (
          <Fragment>
            <div>Transaction taking place</div>
          </Fragment>
        ) : (
          <Fragment>
            <div>Tx can take place</div>
            <button onClick={txBroadcast}>Send Tx</button>
          </Fragment>
        ))}
      {txId && <div>Transaction id: {txId}</div>}
    </Fragment>
  );
};

class Send extends Component {
  state = { to: '', toId: '', amount: null };

  componentDidUpdate(prevProps) {
    if (
      prevProps.wallet &&
      prevProps.wallet.id !== this.props.wallet.id &&
      prevProps.wallet.symbol !== this.props.wallet.symbol
    ) {
      this.setState({ to: '', toId: '' });
    }
  }

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
    const { to, toId, amount } = this.state;
    const filteredContacts = wallet
      ? contacts.filter(
          ({ symbol }) =>
            symbol && symbol.toLowerCase() === wallet.symbol.toLowerCase(),
        )
      : [];
    const filteredWallets = wallet
      ? wallets.filter(
          ({ symbol }) =>
            symbol && symbol.toLowerCase() === wallet.symbol.toLowerCase(),
        )
      : [];

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
            <div>From</div>
            {wallets.length ? (
              <select defaultValue="" onChange={this.onSelectFromChange}>
                <option key="send-from-label" disabled value="" hidden>
                  My Wallets
                </option>
                {wallets.map(({ id, alias, symbol }) => (
                  <option key={`send-from-${id}`} value={id}>
                    {alias} ({symbol})
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
                  <div>Balance: {balance}</div>
                )}
              </Fragment>
            )}
            {wallet && (
              <Fragment>
                <div>To</div>
                <input
                  type="text"
                  name="to"
                  placeholder="to"
                  value={to}
                  onChange={this.onInputToChange}
                />
                <select value={toId} onChange={this.onSelectToChange}>
                  <option key="send-to-label" disabled value="" hidden>
                    Contacts & My Wallets
                  </option>
                  {filteredContacts.length && (
                    <optgroup key="send-to-contacts" label="Contacts">
                      {filteredContacts.map(({ id, alias }) => (
                        <option
                          key={`send-to-contact-${id}`}
                          value={`contact-${id}`}
                        >
                          {alias}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {filteredWallets.length && (
                    <optgroup key="send-to-my-wallets" label="My Wallets">
                      {filteredWallets.map(({ id, alias }) => (
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
              </Fragment>
            )}
            {wallet &&
              to &&
              amount &&
              balance && (
                <TxStore
                  to={to}
                  from={wallet.publicAddress}
                  fromSymmbol={wallet.symbol}
                  amount={amount}
                  balance={balance}
                  privateKey={wallet.privateKey}
                >
                  <Tx />
                </TxStore>
              )}
          </Fragment>
        )}
      </Fragment>
    );
  }

  onInputAmountBlur = e => {
    this.setState({ amount: parseFloat(e.currentTarget.value) });
  };

  onInputToChange = e => {
    this.setState({ to: e.currentTarget.value, toId: '' });
  };

  onSelectFromChange = e => {
    const walletId = e.currentTarget.value;
    this.props.walletPick(walletId);
  };

  onSelectToChange = e => {
    const value = e.currentTarget.value;
    let list = this.props.wallets;
    let prefix = 'wallet-';
    if (value.includes('contact-')) {
      prefix = 'contact-';
      list = this.props.contacts;
    }
    const { publicAddress: to, id } = list.find(
      ({ id }) => `${prefix}${id}` === value,
    );
    this.setState({ to, toId: `${prefix}${id}` });
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
