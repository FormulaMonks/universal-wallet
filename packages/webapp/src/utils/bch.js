import bch from 'bitcoincashjs';
import { Insight } from 'bitcore-explorers';

const TESTNET = process.env.REACT_APP_TESTNET ? 'testnet' : 'livenet';
const { Address, PrivateKey, Transaction } = bch;
const insight = process.env.REACT_APP_TESTNET
  ? new Insight('https://test-bch-insight.bitpay.com')
  : new Insight('https://bch-insight.bitpay.com');

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
  const mappedUtxos = utxos.map(
    ({ address, txid, vout, scriptPubKey, satoshis }) => ({
      txid,
      vout,
      scriptPubKey,
      satoshis,
    }),
  );
  const tx = Transaction();
  tx.from(mappedUtxos);
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

export const BITCOIN_CASH_SYMBOL_LOWER_CASED = 'bch'

export const generateBchWallet = () => {
  const privateKey = new PrivateKey(TESTNET);
  const publicAddress = privateKey.toAddress();

  return {
    privateKey: privateKey.toString(),
    publicAddress: publicAddress.toString(),
    symbol: BITCOIN_CASH_SYMBOL_LOWER_CASED,
  };
};

export const validateAddress = address => Address.isValid(address, TESTNET);

export const fetchFee = async ({ to, from, privateKey, amount }) => {
  const fromAddress = Address.fromString(from, TESTNET);
  const toAddress = Address.fromString(to, TESTNET);
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
  const fromAddress = Address.fromString(from, TESTNET);
  const toAddress = Address.fromString(to, TESTNET);
  const utxos = await getUnspentUtxos(fromAddress);
  const tx = generateTx({
    utxos,
    fromAddress,
    toAddress,
    privateKey,
    amount,
  });
  const { result } = await broadcastTx(tx);
  return result;
};
