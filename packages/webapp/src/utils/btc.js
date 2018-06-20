import { Address, Transaction, PrivateKey } from 'bitcore-lib';
import { Insight } from 'bitcore-explorers';

const { REACT_APP_TESTNET } = process.env;

const NETWORK = REACT_APP_TESTNET ? 'testnet' : 'livenet';

const insight = new Insight(NETWORK);

const URL = REACT_APP_TESTNET
  ? 'https://testnet.blockexplorer.com'
  : 'https://blockexplorer.com';

const URL_API = URL + '/api/addr/'

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

export const toSatoshi = btc => btc * 100000000;

export const toBTC = satoshi => satoshi / 100000000;

export const NAME = 'Bitcoin';

export const SYMBOL = 'btc';

export const URL_TX = URL + '/tx/'

export const toWif = privateKey => {
  const pk = new PrivateKey(privateKey);
  return pk.toWIF();
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

export const toPublicAddress = privateKey => {
  const pk = new PrivateKey(privateKey);
  return pk.toAddress(NETWORK).toString('hex');
};

export const getBalance = async privateKey => {
  const raw = await fetch(URL_API + toPublicAddress(privateKey));
  const { balance } = await raw.json();
  return balance;
};

export const getTransactions = async privateKey => {
  const raw = await fetch(URL_API + toPublicAddress(privateKey));
  const { transactions } = await raw.json();
  return transactions;
}
