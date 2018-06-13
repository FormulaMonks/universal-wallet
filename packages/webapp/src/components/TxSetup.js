import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { CoinsTokens, CurrencyStore, CurrencyView, Tx } from './';
import { sort as sortAddressBook } from '../components/AddressBook/AddressBook';
import { sort as sortWallets } from '../components/Wallets';
import { sort as sortTokens } from '../components/CustomTokens/CustomTokens';
import {
  StickySummary,
  Leaders,
  LeadersCoins,
  LeadersQrScan,
  Dots,
} from '../theme';
import { canBroadcast } from '../utils/ss';

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

const LeadersOptions = LeadersQrScan.extend`
  & select {
    width: 30px;
    height: 30px;
    position: absolute;
    right: 0;
    opacity: 0;
    cursor: pointer;
  }
`;

// filters out unavailable coins for this wallet to pick from wallets/address book
// if same coin is unavailable it is not filtered out since txs to same
// coin are available
// same custom token is not filtered out
const filterOutUnavailableCoins = (coins, tokens, fromSymbol) => ({ symbol }) =>
  coins.find(
    c =>
      c.symbol === symbol &&
      (c.status !== 'unavailable' || c.symbol === fromSymbol) ||
    tokens.find(t => t.symbol === symbol)
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
    const {
      wallet,
      walletsLoading,
      coinsLoading,
      addressBookLoading,
      tokens,
      tokensLoading,
    } = this.props;
    if (
      !wallet ||
      walletsLoading ||
      coinsLoading ||
      addressBookLoading ||
      tokensLoading
    ) {
      return null;
    }

    const { symbol } = wallet;
    const token = tokens.find(t => t.symbol === symbol);
    if (!canBroadcast(symbol) && !token) {
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

    const { balance, coins, addressBook, wallets } = this.props;
    const { to, toId, toSymbol, amount } = this.state;
    const filterOut = filterOutUnavailableCoins(coins, tokens, symbol);
    const filteredWallets = wallets
      .filter(({ id }) => id !== wallet.id)
      .filter(filterOut);
    const filteredAddressBook = addressBook.filter(filterOut);
    const filteredTokens = tokens.filter(t => t.symbol === symbol);

    return (
      <details>
        <StickySummary>
          <H4>Send {symbol.toUpperCase()}</H4>
        </StickySummary>

        <div>
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

          <LeadersCoins>
            <div>Crypto currency/Custom tokens</div>
            <Dots />
            <CoinsTokens
              onChange={this.onSelectToSymbolChange}
              coin={coins.find(({ symbol }) => toSymbol === symbol)}
              coins={coins}
              tokens={filteredTokens}
              token={tokens.find(({ symbol }) => toSymbol === symbol)}
              filterOutUnavailable={true}
            />
          </LeadersCoins>

          <LeadersQrScan>
            <div>Scan from QR Code</div>
            <Dots />
            <button title="Scan from QR Code" onClick={this.props.qrScan}>
              <i className="fas fa-qrcode" />
            </button>
          </LeadersQrScan>

          <LeadersOptions>
            <div>Choose from Wallets/Address book</div>
            <Dots />
            <i className="far fa-address-book" />
            <Fragment>
              {filteredAddressBook.length &&
                filteredWallets.length && (
                  <select value={toId} onChange={this.onSelectToChange}>
                    <option key="send-to-label" disabled value="" hidden>
                      Address Book / My Wallets / Custom Tokens
                    </option>

                    {filteredAddressBook.length && (
                      <optgroup key="send-to-address-book" label="Address Book">
                        {filteredAddressBook
                          .sort(sortAddressBook)
                          .map(({ id, alias, symbol }) => (
                            <option
                              key={`send-to-address-book-${id}`}
                              value={`address-book-${id}`}
                            >
                              {alias} {symbol.toUpperCase()}
                            </option>
                          ))}
                      </optgroup>
                    )}

                    {filteredWallets.length && (
                      <optgroup key="send-to-my-wallets" label="My Wallets">
                        {filteredWallets
                          .sort(sortWallets)
                          .map(({ id, alias, symbol }) => (
                            <option
                              key={`send-to-my-wallets-${id}`}
                              value={`wallet-${id}`}
                            >
                              {alias} {symbol.toUpperCase()}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                )}
            </Fragment>
          </LeadersOptions>
        </div>

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
    const { wallets, tokens, addressBook } = this.props;
    const value = e.currentTarget.value;
    let list = wallets;
    let prefix = 'wallet-';
    if (value.includes('address-book-')) {
      prefix = 'address-book-';
      list = addressBook;
    }
    const { publicAddress: to, id, symbol: toSymbol } = list.find(
      ({ id }) => `${prefix}${id}` === value,
    );
    this.setState({ to, toId: `${prefix}${id}`, toSymbol });
  };

  onSelectToSymbolChange = toSymbol => {
    this.setState({ toSymbol });
  };
}
