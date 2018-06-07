import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { CoinsView, CurrencyStore, CurrencyView, Tx } from './';
import { sort as sortContacts } from '../components/Contacts';
import { sort as sortWallets } from '../components/Wallets';
import { Leaders, Dots } from '../theme';
import { canBroadcast } from '../utils/ss';

const Summary = styled.summary`
  position: sticky;
  top: 70px;
  display: block;
  background: #fff;
  z-index: 1;
`;

const WrapBroadcast = styled.div`
  & input {
    text-align: right;
    border: none;
    border-bottom: 1px solid #eee;
    position: relative;
    top: -4px;
  }

  & input[name='amount'] {
    width: 60px;
  }
`;

const H4 = styled.h4`
  display: inline-block;
`;

const DivToCurrency = styled.div`
  color: #999;
  margin-top: 1em;
  margin-left: 1em;
`;

const DivCurrency = styled.div`
  color: #bbb;
  margin-left: 0.5em;
`;

const LeadersDeposit = Leaders.extend`
  margin: 2em 0 1em 0;
`;

const LeadersCoin = Leaders.extend`
  margin-left: 1em;

  & select {
    max-width: 150px;
    text-align: right;
    text-align-last: right;
  }
`;

const LeadersOptions = Leaders.extend`
  margin-left: 1em;
  position: relative;

  & button {
    border: none;
    cursor: pointer;
    background: none;
    padding: 0;
  }

  & svg {
    font-size: 28px;
    color: #444;
  }

  & select {
    width: 30px;
    height: 30px;
    position: absolute;
    right: 0;
    opacity: 0;
    cursor: pointer;
  }
`;

// filters out unavailable coins for this wallet to pick from wallets/contacts
// if same coin is unavailable it is not filtered out since txs to same
// coin are available
const filterOutUnavailableCoins = (coins, fromSymbol) => ({ symbol }) =>
  coins.find(
    c =>
      c.symbol === symbol &&
      (c.status !== 'unavailable' || c.symbol === fromSymbol),
  );

export default class SetupTx extends Component {
  state = { to: '', toId: '', toSymbol: '', amount: 0 };

  componentDidUpdate(prevProps) {
    const { qrData, qrClear } = this.props;
    if (qrData && !prevProps.qrData) {
      this.setState({ to: qrData, toSymbol: '' }, qrClear);
    }
  }

  render() {
    const { wallet, coinsLoading, contactsLoading } = this.props;
    if (!wallet || coinsLoading || contactsLoading) {
      return null;
    }

    const { symbol } = wallet;
    if (!canBroadcast(symbol)) {
      return (
        <details>
          <summary>
            <H4>
              Sending transactions for this type of coin has not yet been
              implemented
            </H4>
          </summary>
        </details>
      );
    }

    const { balance, coins, contacts, wallets } = this.props;
    const { to, toId, toSymbol, amount } = this.state;
    const filterOut = filterOutUnavailableCoins(coins, symbol);
    const filteredWallets = wallets
      .filter(({ id }) => id !== wallet.id)
      .filter(filterOut);
    const filteredContacts = contacts.filter(filterOut);

    return (
      <details>
        <Summary>
          <H4>Send {symbol}</H4>
        </Summary>

        <WrapBroadcast>
          <Leaders>
            <div>Amount</div>
            <Dots />
            <input
              name="amount"
              placeholder="amount"
              value={amount}
              type="text"
              onInput={this.onInputAmountInput}
            />
          </Leaders>

          <Leaders>
            <DivToCurrency>Estimated USD</DivToCurrency>
            <Dots />
            <DivCurrency>
              <CurrencyStore balanceSymbol={wallet.symbol} balance={amount}>
                <CurrencyView />
              </CurrencyStore>
            </DivCurrency>
          </Leaders>

          <LeadersDeposit>
            <div>Deposit address</div>
            <Dots />
            <input
              type="text"
              name="to"
              placeholder="Public Address"
              value={to}
              onChange={this.onInputToChange}
            />
          </LeadersDeposit>

          <LeadersCoin>
            <div>Crypto currency</div>
            <Dots />
            <CoinsView
              {...this.props}
              onChange={this.onSelectToSymbolChange}
              value={toSymbol}
              filterOutUnavailable={true}
            />
          </LeadersCoin>

          <LeadersOptions>
            <div>Scan from QR Code</div>
            <Dots />
            <button title="Scan from QR Code" onClick={this.props.qrScan}>
              <i className="fas fa-qrcode" />
            </button>
          </LeadersOptions>

          <LeadersOptions>
            <div>Choose from Wallets/Contacts</div>
            <Dots />
            <i className="far fa-address-book" />
            <Fragment>
              {filteredContacts.length &&
                filteredWallets.length && (
                  <select value={toId} onChange={this.onSelectToChange}>
                    <option key="send-to-label" disabled value="" hidden>
                      Contacts & My Wallets
                    </option>
                    {filteredContacts.length && (
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
            </Fragment>
          </LeadersOptions>
        </WrapBroadcast>

        <Tx
          to={to}
          toSymbol={toSymbol}
          from={wallet.publicAddress}
          fromSymbol={wallet.symbol}
          amount={amount}
          balance={balance}
          privateKey={wallet.privateKey}
        />
      </details>
    );
  }

  onInputAmountInput = e => {
    this.setState({ amount: e.currentTarget.value });
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
