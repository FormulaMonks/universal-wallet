import {
  generateBtcWallet,
  BITCOIN_SYMBOL_LOWER_CASED,
  exportBtcWif,
  importBtcWif,
} from './btc';
import { generateBchWallet, BITCOIN_CASH_SYMBOL_LOWER_CASED } from './bch';
import { generateEthWallet, ETHER_SYMBOL_LOWER_CASED } from './eth';
import { generateBtgWallet, BITCOIN_GOLD_SYMBOL_LOWER_CASED } from './btg';

export const AVAILABLE_WALLET_GENERATORS = [
  {
    name: 'Bitcoin',
    symbol: BITCOIN_SYMBOL_LOWER_CASED,
    method: generateBtcWallet,
  },
  {
    name: 'Bitcoin Cash',
    symbol: BITCOIN_CASH_SYMBOL_LOWER_CASED,
    method: generateBchWallet,
  },
  {
    name: 'Ethereum',
    symbol: ETHER_SYMBOL_LOWER_CASED,
    method: generateEthWallet,
  },
  {
    name: 'Bitcoin Gold',
    symbol: BITCOIN_GOLD_SYMBOL_LOWER_CASED,
    method: generateBtgWallet,
  },
];

export const generateWallet = symbol => {
  const option = AVAILABLE_WALLET_GENERATORS.find(
    i => i.symbol.toLowerCase() === symbol.toLowerCase(),
  );
  if (!option) {
    throw new Error(`Cannot generate wallet for ${symbol}`);
  }

  return option.method();
};

export const AVAILABLE_WALLET_EXPORT_WIF = {
  [BITCOIN_SYMBOL_LOWER_CASED]: exportBtcWif,
};

export const exportWif = ({ privateKey, symbol }) => {
  if (!AVAILABLE_WALLET_EXPORT_WIF[symbol.toLowerCase()]) {
    throw new Error(`Cannot export wallet to WIF for ${symbol}`);
  }

  return AVAILABLE_WALLET_EXPORT_WIF[symbol.toLowerCase()](privateKey);
};

export const AVAILABLE_WALLET_IMPORT_WIF = {
  [BITCOIN_SYMBOL_LOWER_CASED]: { name: 'Bitcoin', method: importBtcWif },
};

export const importWif = ({ symbol, wif }) => {
  if (!AVAILABLE_WALLET_IMPORT_WIF[symbol.toLowerCase()]) {
    throw new Error(`Cannot import wallet from WIF for ${symbol}`);
  }

  return AVAILABLE_WALLET_IMPORT_WIF[symbol.toLowerCase()].method(wif);
};
