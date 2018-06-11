import bch from 'bitcoincashjs';
import { Insight } from 'bitcore-explorers';

const TESTNET = process.env.REACT_APP_TESTNET ? 'testnet' : 'livenet';

const { REACT_APP_TESTNET } = process.env;

const { Address, PrivateKey, Transaction } = bch;

const insight = REACT_APP_TESTNET
  ? new Insight('https://test-bch-insight.bitpay.com')
  : new Insight('https://bch-insight.bitpay.com');

const NETWORK = REACT_APP_TESTNET ? 'testnet' : 'livenet';

const balanceURL = REACT_APP_TESTNET
  ? 'https://test-bch-insight.bitpay.com/api/addr/'
  : 'https://bch-insight.bitpay.com/api/addr/';

const transactionsURL = REACT_APP_TESTNET
  ? 'https://test-bch-insight.bitpay.com/api/addr/'
  : 'https://bch-insight.bitpay.com/api/addr/';

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

export const NAME = 'Bitcoin cash';

export const SYMBOL = 'bch';

export const DEFAULTS = {
  balanceURL,
  balanceProp: 'balance',
  balanceUnit: 1,
  transactionsURL,
  transactionsProp: 'transactions',
  symbol: SYMBOL
};

export const toWif = privateKey => {
  const pk = new PrivateKey(privateKey);
  return pk.toWIF();
};

export const fromWif = wif => {
  const privateKey = PrivateKey.fromWIF(wif);
  const publicAddress = privateKey.toAddress(NETWORK);

  return {
    privateKey: privateKey.toString(),
    publicAddress: publicAddress.toString(),
    ...DEFAULTS
  };
};

export const generateWallet = () => {
  const privateKey = new PrivateKey(TESTNET);
  const publicAddress = privateKey.toAddress();

  return {
    privateKey: privateKey.toString(),
    publicAddress: publicAddress.toString(),
    ...DEFAULTS,
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
