import React, { Component, Fragment } from 'react';
import { CoinsView, CurrencyStore, CurrencyView, TxStore, TxView } from './';
import { sort as sortContacts } from '../components/Contacts';
import { sort as sortWallets } from '../components/Wallets';

export default class SetupTx extends Component {
  state = { to: '', toId: '', toSymbol: '', amount: null };

  render() {
    const { wallet } = this.props;
    if (!wallet) {
      return null;
    }

    const { balance, contacts, wallets } = this.props;
    const { to, toId, toSymbol, amount } = this.state;
    const filteredWallets = wallets.filter(({ id }) => id !== wallet.id);

    return (
      <Fragment>
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
            <CoinsView
              {...this.props}
              onChange={this.onSelectToSymbolChange}
              value={toSymbol}
            />
            {contacts.length &&
              filteredWallets.length && (
                <select value={toId} onChange={this.onSelectToChange}>
                  <option key="send-to-label" disabled value="" hidden>
                    Contacts & My Wallets
                  </option>
                  {contacts.length && (
                    <optgroup key="send-to-contacts" label="Contacts">
                      {contacts.sort(sortContacts).map(({ id, alias }) => (
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
                      {filteredWallets
                        .sort(sortWallets)
                        .map(({ id, alias }) => (
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
              )}
            <input
              type="text"
              name="amount"
              placeholder="amount"
              onBlur={this.onInputAmountBlur}
            />
            <CurrencyStore balanceSymbol={wallet.symbol} balance={amount}>
              <CurrencyView />
            </CurrencyStore>
          </Fragment>
        )}
        <TxStore
          to={to}
          toSymbol={toSymbol}
          from={wallet.publicAddress}
          fromSymbol={wallet.symbol}
          amount={amount}
          balance={balance}
          privateKey={wallet.privateKey}
        >
          <TxView />
        </TxStore>
      </Fragment>
    );
  }

  onInputAmountBlur = e => {
    this.setState({ amount: parseFloat(e.currentTarget.value) });
  };

  onInputToChange = e => {
    this.setState({ to: e.currentTarget.value, toId: '', toSymbol: '' });
  };

  onSelectToChange = e => {
    const value = e.currentTarget.value;
    let list = this.props.wallets;
    let prefix = 'wallet-';
    if (value.includes('contact-')) {
      prefix = 'contact-';
      list = this.props.contacts;
    }
    const { publicAddress: to, id, symbol: toSymbol } = list.find(
      ({ id }) => `${prefix}${id}` === value,
    );
    this.setState({ to, toId: `${prefix}${id}`, toSymbol });
  };

  onSelectToSymbolChange = e => {
    this.setState({ toSymbol: e.currentTarget.value });
  };
}
