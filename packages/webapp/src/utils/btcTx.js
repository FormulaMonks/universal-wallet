import bitcore from 'bitcore-lib';
import { Insight } from 'bitcore-explorers';

const { Address, Transaction } = bitcore;
const insight = new Insight('testnet');
const toSatoshi = btc => btc * 100000000;
const toBTC = satoshi => satoshi / 100000000;

export const validateAddress = Address.isValid

export const fetchFee = async ({ to, from, privateKey, amount }) => {
  const fromAddress = Address.fromString(from);
  const toAddress = Address.fromString(to);

  return await new Promise(r => {
    insight.getUnspentUtxos(fromAddress, (err, utxos) => {
      if (err) {
        throw err;
      }

      const tx = Transaction();
      tx.from(utxos);
      tx.to(toAddress, toSatoshi(amount));
      tx.change(fromAddress);
      tx.sign(privateKey);
      tx.serialize();

      const { inputs, outputs } = tx.toObject();
      const totalInputs = inputs.reduce((p, c) => p + c.output.satoshis, 0);
      const totalOutputs = outputs.reduce((p, c) => p + c.satoshis, 0);
      const fee = totalInputs - totalOutputs;

      r(toBTC(fee));
    });
  });
};

export const broadcast = async ({ to, from, privateKey, amount }) => {
  const fromAddress = Address.fromString(from);
  const toAddress = Address.fromString(to);

  return await new Promise(r => {
    insight.getUnspentUtxos(fromAddress, (err, utxos) => {
      if (err) {
        throw err;
      }

      const tx = Transaction();
      tx.from(utxos);
      tx.to(toAddress, toSatoshi(amount));
      tx.change(fromAddress);
      tx.sign(privateKey);
      tx.serialize();

      insight.broadcast(tx.toString(), (err, txId) => {
        if (err) {
          throw err;
        }

        r(txId);
      });
    });
  });
};
