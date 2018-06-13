import { DEFAULTS, generateWallet, fromWif as fromWifEth } from './eth';

export const defaults = ({ symbol, decimals }) => {
  const { symbol: ethSymbol, balanceUnit: ethBalanceUnit, ...rest } = DEFAULTS;
  return { ...rest, symbol, balanceUnit: 1 / 10 ** decimals };
};

export const generate = ({ symbol, decimals }) => {
  const {
    symbol: ethSymbol,
    balanceUnit: ethBalanceUnit,
    ...rest
  } = generateWallet();
  return { ...rest, symbol, balanceUnit: 1 / 10 ** decimals };
};

export const fromWif = ({ token: { symbol, decimals }, wif }) => {
  const {
    symbol: ethSymbol,
    balanceUnit: ethBalanceUnit,
    ...rest
  } = fromWifEth(wif);
  return { ...rest, symbol, balanceUnit: 1 / 10 ** decimals };
};
