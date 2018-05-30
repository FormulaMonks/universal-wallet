import bitcore from 'bitcore-lib';
import { Insight } from 'bitcore-explorers';

const { Address, Transaction } = bitcore;
const insight = new Insight('testnet');
const toSatoshi = btc => btc * 100000000;
const toBTC = satoshi => satoshi / 100000000;
const getUnspentUtxos = address =>
  new Promise(r =>
    insight.getUnspentUtxos(address, (err, utxos) => {
      if (err) {
        throw new Error(`Could not get unspent utxos: ${err}`);
      }
      r(utxos);
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
  new Promise(r =>
    insight.broadcast(tx.toString(), (err, txId) => {
      if (err) {
        throw new Error(`Could not broadcast transaction: ${err}`);
      }
      r(txId);
    }),
  );

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
