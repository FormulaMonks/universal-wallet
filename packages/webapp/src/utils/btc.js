import bitcore from 'bitcore-lib';
import { Insight } from 'bitcore-explorers';

const { Address, Transaction } = bitcore;
const insight = process.env.REACT_APP_TESTNET
  ? new Insight('testnet')
  : new Insight();

const toSatoshi = btc => btc * 100000000;
const toBTC = satoshi => satoshi / 100000000;

const getUnspentUtxos = address =>
  new Promise((resolve, reject) =>
    insight.getUnspentUtxos(address, (err, utxos) => {
      if (err) {
        reject(`Could not get unspent utxos: ${err}`);
      }
      resolve(utxos);
    }),
  );

const generateTx = ({ utxos, fromAddress, toAddress, privateKey, amount }) => {
  const tx = Transaction();
  tx.from(utxos);
  tx.to(toAddress, toSatoshi(amount));
  tx.change(fromAddress);
  try {
    tx.sign(privateKey);
    tx.serialize();
  } catch (err) {
    throw new Error(`Could not sign & serialize transaction: ${err}`);
  }
  return tx;
};

const broadcastTx = tx =>
  new Promise((resolve, reject) =>
    insight.broadcast(tx.toString(), (err, txId) => {
      if (err) {
        reject(`Could not broadcast transaction: ${err}`);
      }
      resolve(txId);
    }),
  );

export const BITCOIN_SYMBOL_LOWER_CASED = 'btc'

export const generateBtcWallet = () => {
  const randBuf = bitcore.crypto.Random.getRandomBuffer(32);
  const randNum = bitcore.crypto.BN.fromBuffer(randBuf);
  const privateKey = new bitcore.PrivateKey(randNum);
  const publicAddress = privateKey.toAddress();

  return {
    privateKey,
    publicAddress,
    symbol: BITCOIN_SYMBOL_LOWER_CASED,
  };
};


export const validateAddress = Address.isValid;

export const fetchFee = async ({ to, from, privateKey, amount }) => {
  const fromAddress = Address.fromString(from);
  const toAddress = Address.fromString(to);
  const utxos = await getUnspentUtxos(fromAddress);
  const tx = generateTx({
    utxos,
    fromAddress,
    toAddress,
    privateKey,
    amount,
  });
  const { inputs, outputs } = tx.toObject();
  const totalInputs = inputs.reduce((p, c) => p + c.output.satoshis, 0);
  const totalOutputs = outputs.reduce((p, c) => p + c.satoshis, 0);
  const fee = totalInputs - totalOutputs;
  return toBTC(fee);
};

export const broadcast = async ({ to, from, privateKey, amount }) => {
  const fromAddress = Address.fromString(from);
  const toAddress = Address.fromString(to);
  const utxos = await getUnspentUtxos(fromAddress);
  const tx = generateTx({
    utxos,
    fromAddress,
    toAddress,
    privateKey,
    amount,
  });
  return await broadcastTx(tx);
};
