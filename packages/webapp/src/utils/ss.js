import { broadcast as btcBroadcast, BITCOIN_SYMBOL_LOWER_CASED } from './btc';
import {
  broadcast as bchBroadcast,
  BITCOIN_CASH_SYMBOL_LOWER_CASED,
} from './bch';
import { broadcast as ethBroadcast, ETHER_SYMBOL_LOWER_CASED } from './eth';

console.log('Add symbols with transacionts here');
const AVAILABLE_SYMBOLS_FOR_BROADCAST = [
  BITCOIN_SYMBOL_LOWER_CASED,
  BITCOIN_CASH_SYMBOL_LOWER_CASED,
  ETHER_SYMBOL_LOWER_CASED,
];

export const SHAPESHIFT = 'https://shapeshift.io/';

export const SHAPESHIFT_MARKET_INFO = `${SHAPESHIFT}marketinfo/`;

export const SHAPESHIFT_GETCOINS = `${SHAPESHIFT}getcoins/`;

export const SHAPESHIFT_SHIFT = `${SHAPESHIFT}shift/`;

export const SHAPESHIFT_SEND_AMOUNT = `${SHAPESHIFT}sendamount/`;

export const SHAPESHIFT_VALIDATE_ADDRESS = `${SHAPESHIFT}validateAddress/`;

export const fetchMarketInfo = async (fromSymbol, toSymbol) => {
  const res = await fetch(
    `${SHAPESHIFT_MARKET_INFO}${fromSymbol.toLowerCase()}_${toSymbol.toLowerCase()}`,
  );
  return await res.json();
};

export const validAddressSymbol = async (address, symbol) => {
  const res = await fetch(`${SHAPESHIFT_VALIDATE_ADDRESS}${address}/${symbol}`);
  return await res.json();
};

export const placeOrder = async opts => {
  const res = await fetch(SHAPESHIFT_SEND_AMOUNT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(opts),
  });
  const tx = await res.json();

  if (tx.hasOwnProperty('error')) {
    throw new Error(tx.error);
  }
  if (!tx.hasOwnProperty('success')) {
    throw new Error(JSON.stringify(tx));
  }
  return tx.success;
};

export const canBroadcast = symbol =>
  AVAILABLE_SYMBOLS_FOR_BROADCAST.includes(symbol.toLowerCase());

export const broadcast = async ({ fromSymbol, ...params }) => {
  return fromSymbol === ETHER_SYMBOL_LOWER_CASED
    ? ethBroadcast(params)
    : fromSymbol === BITCOIN_CASH_SYMBOL_LOWER_CASED
      ? bchBroadcast(params)
      : btcBroadcast(params);
};
