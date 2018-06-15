import { Address, Transaction, PrivateKey } from '@dashevo/dashcore-lib';
import { Insight } from 'bitcore-explorers';

const { REACT_APP_TESTNET } = process.env;

const NETWORK = REACT_APP_TESTNET ? 'testnet' : 'livenet';

const URL = REACT_APP_TESTNET
  ? 'https://test.insight.dash.siampm.com'
  : 'https://insight.dash.siampm.com';

const insight = new Insight(URL, NETWORK);

const balanceURL = REACT_APP_TESTNET
  ? 'https://test.insight.dash.siampm.com/api/addr/'
  : 'https://insight.dash.siampm.com/api/addr/';

const transactionsURL = REACT_APP_TESTNET
  ? 'https://test.insight.dash.siampm.com/api/addr/'
  : 'https://insight.dash.siampm.com/api/addr/';

const toSatoshi = dash => dash * 100000000;

const toDASH = satoshi => satoshi / 100000000;

const getUnspentUtxos = address =>
  new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`${URL}/api/addrs/${address}/utxo`);
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
  new Promise((resolve, reject) =>
    insight.broadcast(tx.toString(), (err, txId) => {
      if (err) {
        reject(`Could not broadcast transaction: ${err}`);
      }
      resolve(txId);
    }),
  );

export const NAME = 'Dashcoin';

export const SYMBOL = 'dash';

export const DEFAULTS = {
  balanceURL,
  balanceProp: 'balance',
  balanceUnit: 1,
  transactionsURL,
  transactionsProp: 'transactions',
  symbol: SYMBOL,
};

export const toWif = privateKey => {
  const pk = new PrivateKey(privateKey);
  return pk.toWIF();
};

export const fromWif = wif => {
  const privateKey = PrivateKey.fromWIF(wif);
  const publicAddress = privateKey.toAddress(NETWORK);

  return {
    privateKey: privateKey.toString('hex'),
    publicAddress: publicAddress.toString('hex'),
    ...DEFAULTS,
  };
};

export const generateWallet = () => {
  const privateKey = new PrivateKey();
  const publicAddress = privateKey.toAddress(NETWORK);

  return {
    privateKey: privateKey.toString('hex'),
    publicAddress: publicAddress.toString('hex'),
    ...DEFAULTS,
  };
};

export const validateAddress = Address.isValid;

export const fetchFee = async ({ to, from, privateKey, amount }) => {
  const fromAddress = Address.fromString(from);
  const toAddress = Address.fromString(to);
  console.log(
    'fromA: ',
    fromAddress.toString('hex'),
    ' toAddress: ',
    toAddress.toString('hex'),
  );
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
  return toDASH(fee);
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
