import { Address, Transaction, PrivateKey } from '@dashevo/dashcore-lib';
import { toSatoshi, toBTC } from './btc'

const { REACT_APP_TESTNET } = process.env;

const NETWORK = REACT_APP_TESTNET ? 'testnet' : 'livenet';

const URL = REACT_APP_TESTNET
  ? 'https://testnet-insight.dashevo.org'
  : 'https://insight.dashevo.org';

const API = URL + '/insight-api'

const URL_ADDR = API + '/addr/'

const getUnspentUtxos = address =>
  new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`${API}/addrs/${address}/utxo`);
      const data = await res.json();
      resolve(data);
    } catch (err) {
      reject(`Could not get unspent utxos: ${err}`);
    }
  });

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
  new Promise(async (resolve, reject) => {
    try {
      const raw = await fetch(`${API}/tx/send`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawtx: tx.toString() }),
      });
      const { txid } = await raw.json();
      resolve(txid);
    } catch (err) {
      reject(`Could not broadcast tx: ${err}`);
    }
  });

export const NAME = 'Dashcoin';

export const SYMBOL = 'dash';

export const URL_TX = URL + '/insight/tx/'

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
}

export const getBalance = async privateKey => {
  const raw = await fetch(URL_ADDR + toPublicAddress(privateKey));
  const { balance } = await raw.json();
  return balance;
};

export const getTransactions = async privateKey => {
  const raw = await fetch(URL_ADDR + toPublicAddress(privateKey));
  const { transactions } = await raw.json();
  return transactions;
}
