import bitcore from 'bitcore-lib';
import { BITCOIN_SYMBOL_LOWER_CASED } from './constants';

export const generateNewWallet = symbol => {
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
