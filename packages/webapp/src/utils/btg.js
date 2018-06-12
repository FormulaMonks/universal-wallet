import btgjs from 'bgoldjs-lib';
import Wif from 'wif';
import BigInteger from 'bigi';

const { TransactionBuilder } = btgjs;

const { REACT_APP_TESTNET } = process.env;

const NETWORK = REACT_APP_TESTNET
  ? btgjs.networks.bitcoingoldtestnet
  : btgjs.networks.bitcoingold;

const balanceURL = REACT_APP_TESTNET
  ? 'https://test-explorer.bitcoingold.org/insight-api/addr/'
  : 'https://explorer.bitcoingold.org/insight-api/addr/';

const transactionsURL = REACT_APP_TESTNET
  ? 'https://test-explorer.bitcoingold.org/insight-api/addr/'
  : 'https://explorer.bitcoingold.org/insight-api/addr/';

const toSatoshi = btc => btc * 100000000;

const toBTC = satoshi => satoshi / 100000000;

const getUnspentUtxos = address =>
  new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`${balanceURL}/${address}/utxo`);
      const data = await res.json();
      resolve(data);
    } catch (err) {
      reject(`Could not get unspent utxos: ${err}`);
    }
  });

window.btg = btgjs;
window.txb = TransactionBuilder;
const generateTx = ({
  utxos,
  fromAddress,
  toAddress,
  privateKey,
  amount,
}) => {
  const d = BigInteger.fromHex(privateKey);
  const key = new btgjs.ECPair(d, null, { network: NETWORK, compressed: true });

  var pk = btgjs.crypto.hash160(key.getPublicKeyBuffer())
  var spk = btgjs.script.pubKeyHash.output.encode(pk)
  var hashType = btgjs.Transaction.SIGHASH_ALL | btgjs.Transaction.SIGHASH_FORKID
  let scriptPubKey = btgjs.script.witnessPubKeyHash.output.encode(pk)

  const tx = new TransactionBuilder(NETWORK);
  let total = 0;
  utxos.forEach(({ amount, txid, vout, satoshis }, index) => {
    total += satoshis;
    //tx.addInput(txid, vout, btgjs.Transaction.DEFAULT_SEQUENCE, spk);
    //tx.addInput(txid, vout, btgjs.Transaction.DEFAULT_SEQUENCE);
    tx.addInput(txid, vout);
  });
  tx.addOutput(toAddress, toSatoshi(amount));
  tx.addOutput(fromAddress, total - toSatoshi(amount) - toSatoshi(0.001));
  tx.enableBitcoinGold(true)
  //utxos.forEach((_, index) => tx.sign(index, key, scriptPubKey, hashType, toSatoshi(0.001)));
  utxos.forEach(({satoshis}, index) => tx.sign(index, key, scriptPubKey, hashType, satoshis));
  //utxos.forEach((_, index) => tx.sign(index, key,null, hashType, toSatoshi(0.001)));
  //utxos.forEach((_, index) => tx.sign(index, key, null, hashType));
  console.log(tx);

  return { toString: () => tx.build().toHex() };
};

const broadcastTx = tx =>
  new Promise(async (resolve, reject) => {
    const res = await fetch(
      'https://test-explorer.bitcoingold.org/insight-api/tx/send',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawtx: tx.toString() }),
      },
    );
    const json = await res.json();
  });

export const NAME = 'Bitcoin gold';

export const SYMBOL = 'btg';

export const DEFAULTS = {
  balanceURL,
  balanceProp: 'balance',
  balanceUnit: 1,
  transactionsURL,
  transactionsProp: 'transactions',
  symbol: SYMBOL,
};

export const toWif = privateKey => {
  const d = BigInteger.fromHex(privateKey);
  const pk = new btgjs.ECPair(d);
  return Wif.encode(NETWORK.wif, d.toBuffer(32), true);
};

export const fromWif = wif => {
  const pk = btgjs.ECPair.fromWIF(wif, NETWORK);
  const publicAddress = pk.getAddress().toString();
  const privateKey = Wif.decode(wif).privateKey.toString('hex');

  return {
    privateKey,
    publicAddress,
    ...DEFAULTS,
  };
};

export const generateWallet = () => {
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
    ...DEFAULTS,
  };
};

export { validateAddress } from './btc';

export const fetchFee = async ({ to, from, privateKey, amount }) => {
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
  //const { inputs, outputs } = tx.toObject();
  //const totalInputs = inputs.reduce((p, c) => p + c.output.satoshis, 0);
  //const totalOutputs = outputs.reduce((p, c) => p + c.satoshis, 0);
  //const fee = totalInputs - totalOutputs;
  return 0;
  //return toBTC(fee);
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
