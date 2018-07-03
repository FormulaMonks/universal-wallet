import lisk from 'lisk-elements';
const { cryptography, transaction } = lisk;

const URL = process.env.REACT_APP_TESTNET
  ? 'https://testnet-explorer.lisk.io'
  : 'https://explorer.lisk.io';

const API = URL + '/api/';

const toAmount = u => u * 1e-8;

const toUnit = a => a * 1e8;

window.lisk = lisk;

export const NAME = 'Lisk';

export const SYMBOL = 'lsk';

export const URL_TX = URL + '/tx/';

export const toPublicAddress = cryptography.getAddressFromPassphrase;

export const broadcast = () => {};

export const getBalance = async privateKey => {
  return 0;
  const raw = await fetch(
    API + 'getAccount?address=' + toPublicAddress(privateKey),
  );
  const { balance } = await raw.json();
  return toAmount(balance);
};

export const getTransactions = async privateKey => {
  const raw = await fetch(
    API + 'getTransactionsByAddress?address=' + toPublicAddress(privateKey),
  );
  const { transactions } = await raw.json();
  return transactions.map(i => {
    return Object.keys(i).reduce((p, c) => {
      if (typeof i[c] !== 'object') {
        p[c] = i[c];
      }
      return p;
    }, {});
  });
};

export const fetchFee = () => 0;

export const validateAddress = transaction.utils.validateAddress;
