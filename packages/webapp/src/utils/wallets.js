import {
  BITCOIN_SYMBOL_LOWER_CASED,
  BITCOIN_CASH_SYMBOL_LOWER_CASED,
  ETHER_SYMBOL_LOWER_CASED,
} from './constants';
import { generateBtcWallet } from './btcTx';
import { generateBchWallet } from './bchTx';
import { generateEthWallet } from './ethTx';

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
];

export const generateWallet = symbol => {
  const option = AVAILABLE_WALLET_GENERATORS.find(i => i.symbol === symbol);
  if (!option) {
    throw new Error(`Cannot generate wallet for ${symbol}`);
  }

  return option.method();
};
