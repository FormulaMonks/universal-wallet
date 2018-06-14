import * as btc from './btc';
import * as bch from './bch';
import * as eth from './eth';
import * as btg from './btg';
import {
  TOKENS,
  generate as generateWalletERC20,
  fromWif as fromWifERC20,
  toWif as toWifERC20,
  defaults as defaultsERC20,
  getBalance as getBalanceERC20,
  broadcast as broadcastERC20,
} from './erc20';

const wallets = [btc, bch, eth, btg];

/* generate (and the rest too) */
// get generateWallet from wallets or tokens
// two reduces: first one (TOKENS) if there is no hit will return
// the reduce default (function that throws), then the 2nd reduce
// (wallets) looks for a hit
export const generate = symbol =>
  wallets.reduce(
    (p, { SYMBOL, generateWallet }) => {
      if (SYMBOL && SYMBOL === symbol && generateWallet) {
        p = generateWallet;
      }
      return p;
    },
    Object.keys(TOKENS).reduce(
      (p, c) => {
        if (c === symbol) {
          p = generateWalletERC20(symbol);
        }
        return p;
      },
      () => {
        throw new Error(
          `generatewallet method has not been implemented for ${symbol}`,
        );
      },
    ),
  );

export const generateAvailable = () =>
  wallets.reduce(
    (p, { NAME, SYMBOL, generateWallet }) => {
      if (generateWallet && SYMBOL && NAME) {
        p.push({ symbol: SYMBOL, name: NAME });
      }
      return p;
    },
    Object.keys(TOKENS).map(symbol => ({
      symbol,
      name: TOKENS[symbol].name,
    })),
  );

/* to wif */
export const toWif = symbol =>
  wallets.reduce(
    (p, { SYMBOL, toWif }) => {
      if (SYMBOL && SYMBOL === symbol && toWif) {
        p = toWif;
      }
      return p;
    },
    Object.keys(TOKENS).reduce(
      (p, c) => {
        if (c === symbol) {
          p = toWifERC20;
        }
        return p;
      },
      () => {
        throw new Error(`toWIF method has not been implemented for ${symbol}`);
      },
    ),
  );

export const toWifAvailable = () =>
  wallets.reduce(
    (p, { NAME, SYMBOL, toWif }) => {
      if (toWif && SYMBOL && NAME) {
        p.push({ symbol: SYMBOL, name: NAME });
      }
      return p;
    },
    Object.keys(TOKENS).map(symbol => ({
      symbol,
      name: TOKENS[symbol].name,
    })),
  );

/* from wif */
export const fromWif = symbol =>
  wallets.reduce(
    (p, { SYMBOL, fromWif }) => {
      if (SYMBOL && SYMBOL === symbol && fromWif) {
        p = fromWif;
      }
      return p;
    },
    Object.keys(TOKENS).reduce(
      (p, c) => {
        if (c === symbol) {
          p = fromWifERC20(symbol);
        }
        return p;
      },
      () => {
        throw new Error(
          `fromWIF method has not been implemented for ${symbol}`,
        );
      },
    ),
  );

export const fromWifAvailable = () =>
  wallets.reduce(
    (p, { NAME, SYMBOL, fromWif }) => {
      if (fromWif && SYMBOL && NAME) {
        p.push({ symbol: SYMBOL, name: NAME });
      }
      return p;
    },
    Object.keys(TOKENS).map(symbol => ({
      symbol,
      name: TOKENS[symbol].name,
    })),
  );

/* defaults */
export const defaults = symbol =>
  wallets.reduce(
    (p, { DEFAULTS, SYMBOL }) => {
      if (SYMBOL && SYMBOL === symbol && DEFAULTS) {
        p = DEFAULTS;
      }
      return p;
    },
    Object.keys(TOKENS).reduce(
      (p, c) => {
        if (symbol === c) {
          p = defaultsERC20(symbol);
        }
        return p;
      },
      { symbol },
    ),
  );

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
