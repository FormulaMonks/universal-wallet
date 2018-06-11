import * as btc from './btc';
import * as bch from './bch';
import * as eth from './eth';
import * as btg from './btg';

const wallets = [btc, bch, eth, btg];

/* generate */
export const generate = symbol =>
  wallets.reduce(
    (p, { SYMBOL, generateWallet }) => {
      if (SYMBOL && SYMBOL === symbol.toLowerCase() && generateWallet) {
        p = generateWallet;
      }
      return p;
    },
    () => {
      throw new Error(
        `generatewallet method has not been implemented for ${symbol}`,
      );
    },
  );

export const generateAvailable = () => {
  return wallets.reduce((p, { NAME, SYMBOL, generateWallet }) => {
    if (generateWallet && SYMBOL && NAME) {
      p.push({ symbol: SYMBOL, name: NAME });
    }
    return p;
  }, []);
};

/* to wif */
export const toWif = symbol =>
  wallets.reduce(
    (p, { SYMBOL, toWif }) => {
      if (SYMBOL && SYMBOL === symbol.toLowerCase() && toWif) {
        p = toWif;
      }
      return p;
    },
    () => {
      throw new Error(`toWIF method has not been implemented for ${symbol}`);
    },
  );

export const toWifAvailable = () => {
  return wallets.reduce((p, { NAME, SYMBOL, toWif }) => {
    if (toWif && SYMBOL && NAME) {
      p.push({ symbol: SYMBOL, name: NAME });
    }
    return p;
  }, []);
};

/* from wif */
export const fromWif = symbol =>
  wallets.reduce(
    (p, { SYMBOL, fromWif }) => {
      if (SYMBOL && SYMBOL === symbol.toLowerCase() && fromWif) {
        p = fromWif;
      }
      return p;
    },
    () => {
      throw new Error(`fromWIF method has not been implemented for ${symbol}`);
    },
  );

export const fromWifAvailable = () => {
  return wallets.reduce((p, { NAME, SYMBOL, fromWif }) => {
    if (fromWif && SYMBOL && NAME) {
      p.push({ symbol: SYMBOL, name: NAME });
    }
    return p;
  }, []);
};

/* defaults */
export const defaults = symbol =>
  wallets.reduce((p, { DEFAULTS, SYMBOL }) => {
    if (SYMBOL && SYMBOL === symbol.toLowerCase() && DEFAULTS) {
      p = DEFAULTS;
    }
    return p;
  }, {});
