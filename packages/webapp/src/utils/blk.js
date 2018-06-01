import bitcore from 'bitcore-lib';
import { Insight } from 'bitcore-explorers';
import bitcoin from 'bitcoinjs-lib';
import Wif from 'wif';
import BigInteger from 'bigi';
import TxBuilder from 'tx-builder'

window.TxBuilder = TxBuilder
window.bigi = BigInteger;
window.Buffer = Buffer;
window.Wif = Wif;
window.Insight = Insight;
const { Address, PrivateKey, Transaction, Networks } = bitcore;
const BLACKCOIN = 'blackcoin';
window.Ad = Address;
window.bitcore = bitcore;
window.bitcoin = bitcoin;
const insight = new Insight('https://node.blackcoin.io/insight-api');
insight.getUtxos = function(address, callback) {
  this.requestPost(
    '/api/addrs/utxo',
    {
      addrs: address.toString(),
    },
    function(err, res, unspent) {
      if (err || res.statusCode !== 200) {
        return callback(err || res);
      }
      try {
        unspent = unspent.map(Transaction.UnspentOutput);
      } catch (ex) {
        if (ex instanceof bitcore.errors.InvalidArgument) {
          return callback(ex);
        }
      }

      return callback(null, unspent);
    },
  );
};
insight.requestPost = function(path, data, callback) {
  console.log('Make sure this does not show on any other coin');
  console.log('Post: ', path, data, callback);
  path = path.substr(4);
  insight.request(
    {
      method: 'POST',
      url: this.url + path,
      json: data,
    },
    callback,
  );
};
insight.requestGet = function(path, callback) {
  console.log('Make sure this does not show on any other coin');
  path = path.substr(4);
  insight.request(
    {
      method: 'GET',
      url: this.url + path,
    },
    callback,
  );
};
const NETWORK = {
  messagePrefix: '\x18BlackCoin Signed Message:\n',
  bip32: {
    public: 0x02cfbede,
    private: 0x02cfbf60,
  },
  pubKeyHash: 0x19,
  scriptHash: 0x55,
  wif: 0x99,
};
Networks.add({
  name: '\x18BlackCoin Signed Message:\n',
  alias: BLACKCOIN,
  pubkeyhash: 0x19,
  privatekey: '',
  scripthash: 0x55,
  xpubkey: 0x02cfbede,
  xprivkey: 0x02cfbf60,
  networkMagic: '',
});
Networks.defaultNetwork = BLACKCOIN;
window.NT = NETWORK;
window.NT1 = Networks.get(BLACKCOIN);
const toSatoshi = btc => btc * 100000000;
const toBTC = satoshi => satoshi / 100000000;
const getUtxos = address =>
  new Promise((resolve, reject) =>
    insight.getUtxos(address, (err, utxos) => {
      if (err) {
        reject(`Could not get unspent utxos: ${err}`);
      }
      resolve(utxos);
    }),
  );
const generateRawTx = async ({ to, from, privateKey, amount }) => {
  const fromAddress = Address.fromString(from, BLACKCOIN);
  const toAddress = Address.fromString(to, BLACKCOIN);
  const utxos = await getUtxos(fromAddress);
  // generates a raw transaction
  // bitcore-lib was changing the addresses to bitcoin network
  const tx = Transaction();
  window.ut = utxos;
  window.toA = toAddress;
  console.log(utxos);
  console.log(toAddress.toString());
  tx.from(utxos);
  tx.to(toAddress.toString(), toSatoshi(amount));
  tx.change(fromAddress.toString());
  tx.sign(privateKey);
  console.log(tx.toString())
  window.pvk = privateKey;
  window.tx = tx;

  const { inputs, outputs } = tx;
  const totalInputs = inputs.reduce((p, c) => p + c.output.satoshis, 0);
  const totalOutputs = outputs.reduce((p, c) => p + c.satoshis, 0);
  const fee = totalInputs - totalOutputs;
  const rawTx = new bitcoin.TransactionBuilder(NETWORK);
  inputs.forEach(({ prevTxId, outputIndex }) => {
    console.log(prevTxId.toString('hex'), outputIndex);
    rawTx.addInput(prevTxId.toString('hex'), outputIndex);
  });
  // amount
  console.log(1, toAddress.toString(), toSatoshi(amount));
  rawTx.addOutput(toAddress.toString(), toSatoshi(amount));
  // change
  console.log(2, fromAddress.toString(), totalInputs - fee);
  rawTx.addOutput(fromAddress.toString(), totalInputs - fee);
  // sign
  //const myWif = Wif.encodeRaw(153, new Buffer(privateKey, 'hex'), true);
  //const myWif = Wif.encode(NETWORK.wif, new Buffer(privateKey, 'hex'), true);
  //console.log(privateKey, myWif)
  //const key = bitcoin.ECPair.fromWIF(myWif.toString('hex'), NETWORK.wif);
  const d = BigInteger.fromBuffer(
    '26aeab55872dd06a0e0b60fea42a2fe4ef97e727c3b1179d47291ec1825cd33d',
  );
  const key = new bitcoin.ECPair(d, null, {
    compressed: false,
    network: NETWORK,
  });
  inputs.forEach((input, index) => rawTx.sign(index, key));
  window.rT = rawTx
  console.log(rawTx.build().toHex());







  await broadcastTx({ toString: () => rawTx.build().toHex() })
};
const generateTx = ({ utxos, fromAddress, toAddress, privateKey, amount }) => {
  const tx = Transaction();
  console.log(utxos);
  console.log(toAddress.toString());
  tx.from(utxos);
  tx.to(toAddress.toString(), toSatoshi(amount));
  tx.change(fromAddress.toString());
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

export const BLACKCOIN_SYMBOL_LOWER_CASED = 'blk';

export const generateBlkWallet = () => {
  const keyPair = bitcoin.ECPair.makeRandom({ network: NETWORK });
  const publicAddress = keyPair.getAddress().toString();
  const privateKey = Wif.decode(keyPair.toWIF(NETWORK)).privateKey.toString(
    'hex',
  );

  return {
    privateKey,
    publicAddress,
    symbol: BLACKCOIN_SYMBOL_LOWER_CASED,
  };
};

export const validateAddress = Address.isValid;

export const fetchFee = async ({ to, from, privateKey, amount }) => {
  const fromAddress = Address.fromString(from, BLACKCOIN);
  const toAddress = Address.fromString(to, BLACKCOIN);
  const utxos = await getUtxos(fromAddress);
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
  const tx = generateRawTx({ to, from, privateKey, amount });
  return await broadcastTx(tx);
  //const fromAddress = Address.fromString(from, BLACKCOIN);
  //const toAddress = Address.fromString(to, BLACKCOIN);
  //const utxos = await getUtxos(fromAddress);
  //const tx = generateTx({
  //utxos,
  //fromAddress,
  //toAddress,
  //privateKey,
  //amount,
  //});
  //return await broadcastTx(tx);
};