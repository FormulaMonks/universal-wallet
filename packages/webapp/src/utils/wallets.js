import bitcore from 'bitcore-lib';
import {
  BITCOIN_SYMBOL_LOWER_CASED,
  ETHER_SYMBOL_LOWER_CASED,
} from './constants';
import { createAccount } from './ethTx';

export const AVAILABLE_WALLET_GENERATION_COINS = [
  { name: 'Bitcoin ', symbol: BITCOIN_SYMBOL_LOWER_CASED.toUpperCase() },
  { name: 'Ethereum', symbol: ETHER_SYMBOL_LOWER_CASED.toUpperCase() },
];

const generateNewEthWallet = () => {
  const { address: publicAddress, privateKey } = createAccount();

  return {
    privateKey,
    publicAddress,
    symbol: ETHER_SYMBOL_LOWER_CASED.toUpperCase(),
  };
};

const generateNewBtcWallet = () => {
  const randBuf = bitcore.crypto.Random.getRandomBuffer(32);
  const randNum = bitcore.crypto.BN.fromBuffer(randBuf);
  const privateKey = new bitcore.PrivateKey(randNum);
  const publicAddress = privateKey.toAddress();

  return {
    privateKey,
    publicAddress,
    symbol: BITCOIN_SYMBOL_LOWER_CASED.toUpperCase(),
  };
};

export const generateNewWallet = symbol => {
  if (
    !AVAILABLE_WALLET_GENERATION_COINS.find(
      coin => coin.symbol.toLowerCase() === symbol.toLowerCase(),
    )
  ) {
    throw new Error(`Cannot generate wallet for ${symbol}`);
  }

  return symbol.toLowerCase() === ETHER_SYMBOL_LOWER_CASED
    ? generateNewEthWallet()
    : generateNewBtcWallet();
};
