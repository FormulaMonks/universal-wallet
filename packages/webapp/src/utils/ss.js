import { broadcast as broadcastInterface, broadcastAvailable } from './wallets';

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
  const response = await res.json();
  if (response.hasOwnProperty('error')) {
    throw new Error(response.error);
  }
  return response;
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
  broadcastAvailable().find(o => o.symbol === symbol.toLowerCase());

export const broadcast = async ({ fromSymbol, ...params }) => {
  return broadcastInterface(fromSymbol)({ fromSymbol, ...params });
};
