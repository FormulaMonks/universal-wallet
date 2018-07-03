import * as btc from './btc';
import * as bch from './bch';
import * as eth from './eth';
import * as btg from './btg';
import * as ltc from './ltc';
import * as dash from './dash';
import * as lsk from './lsk'
import {
  TOKENS,
  getBalance as getBalanceERC20,
  broadcast as broadcastERC20,
  toPublicAddress as toPublicAddressERC20,
  getTransactions as getTransactionsToken,
  URL_TX as URL_TX_TOKEN,
} from './erc20';

const wallets = [btc, bch, eth, btg, ltc, dash, lsk];

// interface for functions for wallets or tokens
// two reduces: first one (TOKENS) if there is no hit will return
// the reduce default (function that throws), then the 2nd reduce
// (wallets) looks for a hit

/* broadcast */
export const broadcastAvailable = () =>
  wallets.reduce(
    (p, { NAME, SYMBOL, broadcast }) => {
      if (broadcast && SYMBOL && NAME) {
        p.push({ symbol: SYMBOL, name: NAME });
      }
      return p;
    },
    Object.keys(TOKENS).map(symbol => ({
      symbol,
      name: TOKENS[symbol].name,
    })),
  );

export const broadcast = symbol =>
  wallets.reduce(
    (p, { SYMBOL, broadcast }) => {
      if (SYMBOL && SYMBOL === symbol && broadcast) {
        p = broadcast;
      }
      return p;
    },
    Object.keys(TOKENS).reduce(
      (p, c) => {
        if (c === symbol) {
          p = broadcastERC20(symbol);
        }
        return p;
      },
      () => {
        throw new Error(
          `broadcast method has not been implemented for ${symbol}`,
        );
      },
    ),
  );

/* balance */
export const getBalanceAvailable = () =>
  wallets.reduce(
    (p, { NAME, SYMBOL, getBalance }) => {
      if (getBalance && SYMBOL && NAME) {
        p.push({ symbol: SYMBOL, name: NAME });
      }
      return p;
    },
    Object.keys(TOKENS).map(symbol => ({
      symbol,
      name: TOKENS[symbol].name,
    })),
  );

export const getBalance = symbol =>
  wallets.reduce(
    (p, { SYMBOL, getBalance }) => {
      if (SYMBOL && SYMBOL === symbol && getBalance) {
        p = getBalance;
      }
      return p;
    },
    Object.keys(TOKENS).reduce(
      (p, c) => {
        if (c === symbol) {
          p = getBalanceERC20(symbol);
        }
        return p;
      },
      () => {
        throw new Error(
          `getBalance method has not been implemented for ${symbol}`,
        );
      },
    ),
  );

/* to public address */
export const toPublicAddressAvailable = () =>
  wallets.reduce(
    (p, { NAME, SYMBOL, toPublicAddress }) => {
      if (toPublicAddress && SYMBOL && NAME) {
        p.push({ symbol: SYMBOL, name: NAME });
      }
      return p;
    },
    Object.keys(TOKENS).map(symbol => ({
      symbol,
      name: TOKENS[symbol].name,
    })),
  );

export const toPublicAddress = symbol =>
  wallets.reduce(
    (p, { SYMBOL, toPublicAddress }) => {
      if (SYMBOL && SYMBOL === symbol && toPublicAddress) {
        p = toPublicAddress;
      }
      return p;
    },
    Object.keys(TOKENS).reduce(
      (p, c) => {
        if (c === symbol) {
          p = toPublicAddressERC20;
        }
        return p;
      },
      () => {
        throw new Error(
          `toPublicAddress method has not been implemented for ${symbol}`,
        );
      },
    ),
  );

/* transactions */
export const getTransactions = symbol =>
  wallets.reduce(
    (p, { SYMBOL, getTransactions }) => {
      if (SYMBOL && SYMBOL === symbol && getTransactions) {
        p = getTransactions;
      }
      return p;
    },
    Object.keys(TOKENS).reduce(
      (p, c) => {
        if (c === symbol) {
          p = getTransactionsToken(symbol);
        }
        return p;
      },
      () => {
        throw new Error(
          `getTransactions method has not been implemented for ${symbol}`,
        );
      },
    ),
  );

/* transaction url */
export const getTransactionURL = symbol =>
  wallets.reduce(
    (p, { SYMBOL, URL_TX }) => {
      if (SYMBOL && SYMBOL === symbol && URL_TX) {
        p = URL_TX;
      }
      return p;
    },
    Object.keys(TOKENS).reduce((p, c) => {
      if (c === symbol) {
        p = URL_TX_TOKEN;
      }
      return p;
    }, ''),
  );
