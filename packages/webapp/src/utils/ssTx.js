import {
  SHAPESHIFT_SEND_AMOUNT,
  SHAPESHIFT_VALIDATE_ADDRESS,
  SHAPESHIFT_MARKET_INFO
} from './constants';
import { broadcast as btcBroadcast } from './btcTx';

export const fetchMarketInfo = async (fromSymbol, toSymbol) => {
  const res = await fetch(
    `${SHAPESHIFT_MARKET_INFO}${fromSymbol.toLowerCase()}_${toSymbol.toLowerCase()}`,
  );
  return await res.json();
};

export const validAddressSymbol = async (address, symbol) => {
  console.log(`${SHAPESHIFT_VALIDATE_ADDRESS}${address}/${symbol}`)
  const res = await fetch(`${SHAPESHIFT_VALIDATE_ADDRESS}${address}/${symbol}`);
  return await res.json();
};

export const postTx = async opts => {
  const res = await fetch(SHAPESHIFT_SEND_AMOUNT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(opts),
  });
  const tx = await res.json();
  console.log('postTx res: ', tx)

  if (tx.hasOwnProperty('error')) {
    throw tx.error
  }
  if (!tx.hasOwnProperty('success')) {
    throw tx
  }
  return tx.success;
};

export const broadcast = async params => {
  // type of tx?
  return btcBroadcast(params)
};
