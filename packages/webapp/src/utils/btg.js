import { Insight } from 'bitcore-explorers';
import btgjs from 'bgoldjs-lib';
import Wif from 'wif';

const { Transaction } = btgjs;

const NETWORK = process.env.REACT_APP_TESTNET
  ? btgjs.networks.testnet
  : btgjs.networks.bitcoingold;

const insight = process.env.REACT_APP_TESTNET
  ? new Insight('https://testnet.btgexplorer.com')
  : new Insight('https://btgexplorer.com');
  //? new Insight('https://test-explorer.bitcoingold.org/insight-api/')
  //: new Insight('https://explorer.bitcoingold.org/insight-api/');

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

export const BITCOIN_GOLD_SYMBOL_LOWER_CASED = 'btg';

export const generateBtgWallet = () => {
  const keyPair = btgjs.ECPair.makeRandom({
    network: NETWORK,
  });
  const publicAddress = keyPair.getAddress().toString();
  const privateKey = Wif.decode(keyPair.toWIF(NETWORK)).privateKey.toString(
    'hex',
  );

  return {
    privateKey,
    publicAddress,
    symbol: BITCOIN_GOLD_SYMBOL_LOWER_CASED,
  };
};

export { validateAddress } from './btc';

export const fetchFee = async ({ to, from, privateKey, amount }) => {
  //const fromAddress = Address.fromString(from, NETWORK);
  //const toAddress = Address.fromString(to, NETWORK);
  const fromAddress = from;
  const toAddress = to;
  console.log(toAddress, fromAddress);
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
  //const fromAddress = Address.fromString(from, NETWORK);
  //const toAddress = Address.fromString(to, NETWORK);
  const fromAddress = from;
  const toAddress = to;
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
