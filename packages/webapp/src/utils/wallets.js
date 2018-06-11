import { generateBtcWallet, BITCOIN_SYMBOL_LOWER_CASED } from './btc';
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
  const option = AVAILABLE_WALLET_GENERATORS.find(i => i.symbol.toLowerCase() === symbol.toLowerCase());
  if (!option) {
    throw new Error(`Cannot generate wallet for ${symbol}`);
  }

  return option.method();
};
