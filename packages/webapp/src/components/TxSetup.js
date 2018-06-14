import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { CoinsTokens, CurrencyStore, CurrencyView, Tx } from './';
import { Leaders, LeadersCoins, LeadersQrScan, Dots } from '../theme';
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

const filterOutUnavailableCoins = (coins, fromSymbol) => ({ symbol }) => {
  const fromCoin = coins.find(c => c.symbol === fromSymbol);
  const toCoin = coins.find(c => c.symbol === symbol);
  // token
  if (!fromCoin) {
    return false;
  }
  // from coin unavailable
  // except is same symbol as to coin
  if (fromCoin.status !== 'available' && fromCoin.symbol !== toCoin.symbol) {
    return false;
  }
  // to coin is unavailable
  // except if same symbol as from coin
  if (
    !toCoin ||
    (toCoin.status === 'unavailable' && toCoin.symbol !== fromSymbol)
  ) {
    return false;
  }

  return true;
};

const filterOut = (coins, tokens, fromSymbol) => ({ symbol }) => {
  const fromCoin = coins.find(c => c.symbol === fromSymbol);
  const fromToken = tokens.find(t => t.symbol === fromSymbol);
  const from = fromCoin || fromToken;
  const toCoin = coins.find(c => c.symbol === symbol);
  const toToken = tokens.find(t => t.symbol === symbol);
  const to = toCoin || toToken;
  // how did this get here?
  if (!to && !from) {
    return false;
  }
  // coins
  // from coin to token
  if (fromCoin && toToken) {
    return false;
  }
  // from coin is unavailable except if same symbol to coin
  if (
    fromCoin &&
    toCoin &&
    fromCoin.status === 'unavailable' &&
    fromCoin.symbol !== toCoin.symbol
  ) {
    return false;
  }
  // to coin is unavailable except if same symbol as from coin
  if (
    fromCoin &&
    toCoin &&
    toCoin.status === 'unavailable' &&
    fromCoin.symbol !== toCoin.symbol
  ) {
    return false;
  }
  // tokens
  // if from token to coin
  if (fromToken && toCoin) {
    return false;
  }
  // if not same symbol
  if (fromToken && toToken && fromToken.symbol !== toToken.symbol) {
    return false;
  }

  return true;
};

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
    const filteredWallets = wallets
      .filter(({ id }) => id !== wallet.id)
      .filter(filterOut(coins, tokens, symbol));
    const filteredAddressBook = addressBook.filter(
      filterOut(coins, tokens, symbol),
    );
    const filteredTokens = tokens.filter(t => t.symbol === symbol);
    const filteredCoins = coins.filter(
      filterOutUnavailableCoins(coins, symbol),
    );

    return (
      <details>
        <summary>
          <H4>Send {symbol.toUpperCase()}</H4>
        </summary>

        <Leaders>
          <div>Amount</div>
          <Dots />
          <input
            name="amount"
            placeholder="Amount"
            value={amount}
            type="text"
            onInput={this.onInputAmountInput}
          />
        </Leaders>

        <Leaders>
          <DivToCurrency>Estimated USD</DivToCurrency>
          <Dots />
          <DivCurrency>
            <CurrencyStore
              balanceSymbol={wallet.symbol}
              balance={amount}
              coins={coins}
            >
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
            coin={filteredCoins.find(({ symbol }) => toSymbol === symbol)}
            coins={filteredCoins}
            tokens={filteredTokens}
            token={filteredTokens.find(({ symbol }) => toSymbol === symbol)}
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
            {(!!filteredAddressBook.length || !!filteredWallets.length) && (
              <select value={toId} onChange={this.onSelectToChange}>
                <option key="send-to-label" disabled value="" hidden>
                  Address Book / My Wallets
                </option>

                {!!filteredAddressBook.length && (
                  <optgroup key="send-to-address-book" label="Address Book">
                    {filteredAddressBook.map(({ id, alias, symbol }) => (
                      <option
                        key={`send-to-address-book-${id}`}
                        value={`address-book-${id}`}
                      >
                        {alias} ({symbol.toUpperCase()})
                      </option>
                    ))}
                  </optgroup>
                )}

                {!!filteredWallets.length && (
                  <optgroup key="send-to-my-wallets" label="My Wallets">
                    {filteredWallets.map(({ id, alias, symbol }) => (
                      <option
                        key={`send-to-my-wallets-${id}`}
                        value={`wallet-${id}`}
                      >
                        {alias} ({symbol.toUpperCase()})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            )}
          </Fragment>
        </LeadersOptions>

        <Tx
          to={to}
          toSymbol={toSymbol}
          from={wallet.publicAddress}
          fromSymbol={wallet.symbol}
          amount={amount}
          balance={balance}
          privateKey={wallet.privateKey}
          token={token}
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
    const { wallets, addressBook } = this.props;
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
