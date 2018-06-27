import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { BalanceInUSD, CoinsTokens, Tx } from './';
import { Leaders, LeadersCoins, LeadersQrScan, Dots } from '../theme';
import { canBroadcast } from '../utils/ss';
import { toPublicAddress } from '../utils/wallets';
import { toPublicAddress as toPublicAddressToken } from '../utils/tokens';

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
  min-height: 28px;

  & select {
    width: 30px;
    height: 30px;
    position: absolute;
    right: 0;
    opacity: 0;
    cursor: pointer;
  }
`;

const { REACT_APP_TESTNET } = process.env;

// filters out the wallets that can not accept txs from this asset
// and reduces the assets form the wallet that can receive txs
// for same wallet (fromId == id) allows other symbols except same one
// testnet: only available same symbol
const reduceWallets = (coins, tokens, fromSymbol, fromId) => (
  p,
  { assets, ...rest },
) => {
  const { id } = rest;
  const availableForTx = REACT_APP_TESTNET
    ? // testnet
      // only same symbol and different wallet
      assets.filter(symbol => symbol === fromSymbol && fromId !== id)
    : // livenet
      fromId === id
      ? assets
          .filter(symbol => filterOut(coins, tokens, fromSymbol)({ symbol }))
          .filter(s => s !== fromSymbol)
      : assets.filter(symbol =>
          filterOut(coins, tokens, fromSymbol)({ symbol }),
        );
  if (availableForTx.length) {
    p.push({ assets: availableForTx, ...rest });
  }
  return p;
};

const filterOutUnavailableCoins = (coins, fromSymbol) => ({ symbol }) => {
  const fromCoin = coins.find(c => c.symbol === fromSymbol);
  const toCoin = coins.find(c => c.symbol === symbol);
  // token
  if (!fromCoin) {
    return false;
  }
  // from coin unavailable
  // except if same symbol as to coin
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

  // testnet
  if (REACT_APP_TESTNET && toCoin && toCoin.symbol !== fromSymbol) {
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

  // testnet
  if (
    REACT_APP_TESTNET &&
    ((fromToken && toToken && fromToken.symbol !== toToken.symbol) ||
      (toCoin && fromCoin && toCoin.symbol !== fromCoin.symbol))
  ) {
    return false;
  }

  return true;
};

export default class TxSetup extends Component {
  state = { to: '', toSymbol: '', amount: 0 };

  componentDidUpdate(prevProps) {
    const { qrData, qrClear } = this.props;
    if (qrData && !prevProps.qrData) {
      this.setState({ to: qrData, toSymbol: '' }, qrClear);
    }
  }

  render() {
    const {
      addressBook,
      balance,
      coins,
      ordersPost,
      ordersPut,
      tokens,
      symbol,
      wallet: { id, privateKey },
      wallets,
      tokensLoading,
    } = this.props;

    const { to, toSymbol, amount } = this.state;
    const publicAddress = tokensLoading
      ? null
      : tokens.find(t => t.symbol === symbol)
        ? toPublicAddressToken(privateKey)
        : toPublicAddress(symbol)(privateKey);
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

    const filteredWallets = wallets.reduce(
      reduceWallets(coins, tokens, symbol, id),
      [],
    );
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
          <DivToCurrency>USD</DivToCurrency>
          <Dots />
          <DivCurrency>
            <BalanceInUSD {...this.props} balance={amount} />
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
          <div>Address book/My wallets</div>
          <Dots />
          {!(!!filteredAddressBook.length || !!filteredWallets.length) &&
            `None compatible with ${symbol.toUpperCase()}`}
          {(!!filteredAddressBook.length || !!filteredWallets.length) && (
            <Fragment>
              <i className="far fa-address-book" />
              <select onChange={this.onSelectToChange} defaultValue="">
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
                  <Fragment>
                    {filteredWallets.map(({ id, alias, assets }) => {
                      return (
                        <optgroup
                          key={`send-to-my-wallets-${id}`}
                          label={alias}
                        >
                          {assets.map(symbol => {
                            return (
                              <option
                                key={`send-to-my-wallets-${id}-${symbol}`}
                                value={`wallet-${id}--${symbol}`}
                              >
                                {alias} ({symbol.toUpperCase()})
                              </option>
                            );
                          })}
                        </optgroup>
                      );
                    })}
                  </Fragment>
                )}
              </select>
            </Fragment>
          )}
        </LeadersOptions>

        <Tx
          to={to}
          toSymbol={toSymbol}
          from={publicAddress}
          fromSymbol={symbol}
          amount={parseFloat(amount)}
          balance={balance}
          privateKey={privateKey}
          token={token}
          walletId={id}
          ordersPost={ordersPost}
          ordersPut={ordersPut}
        />
      </details>
    );
  }

  onInputAmountInput = ({ currentTarget: { value: amount } }) => {
    this.setState({ amount });
  };

  onInputToChange = e => {
    this.setState({ to: e.currentTarget.value, toSymbol: '' });
  };

  onSelectToChange = ({ currentTarget: { value } }) => {
    const { wallets, addressBook, tokens } = this.props;
    if (value.includes('address-book-')) {
      const { publicAddress: to, symbol: toSymbol } = addressBook.find(
        ({ id }) => `address-book-${id}` === value,
      );
      this.setState({ to, toSymbol });
      return;
    }

    const [val, toSymbol] = value.split('--');
    const { privateKey } = wallets.find(({ id }) => val === `wallet-${id}`);
    const to = tokens.find(t => t.symbol === toSymbol)
      ? toPublicAddressToken(privateKey)
      : toPublicAddress(toSymbol)(privateKey);
    this.setState({ to, toSymbol });
  };

  onSelectToSymbolChange = toSymbol => {
    this.setState({ toSymbol });
  };
}
