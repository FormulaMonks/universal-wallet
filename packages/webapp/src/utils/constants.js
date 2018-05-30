export const WALLETS_JSON = 'wallets.json';

export const CONTACTS_JSON = 'contacts.json';

export const BTC_TO_USD =
  'https://www.bitstamp.net/api/v2/ticker/btcusd/?cors=1';

export const SHAPESHIFT = 'https://shapeshift.io/';

export const SHAPESHIFT_MARKET_INFO = `${SHAPESHIFT}marketinfo/`;

export const SHAPESHIFT_GETCOINS = `${SHAPESHIFT}getcoins/`;

export const SHAPESHIFT_SHIFT = `${SHAPESHIFT}shift/`;

export const SHAPESHIFT_SEND_AMOUNT = `${SHAPESHIFT}sendamount/`;

export const SHAPESHIFT_VALIDATE_ADDRESS = `${SHAPESHIFT}validateAddress/`;

export const BITCOIN_SYMBOL_LOWER_CASED = 'btc';

export const ETHER_SYMBOL_LOWER_CASED = 'eth';

export const INFURA_URL = process.env.REACT_APP_TESTNET
  ? 'https://rinkeby.infura.io/'
  : 'https://mainnet.infura.io/';

export const INFURA_NETWORK = `${INFURA_URL}${
  process.env.REACT_APP_INFURA_API_KEY
}`;

// chainId - mainnet: 1, rinkeby: 4
export const INFURA_CHAIN_ID = process.env.REACT_APP_TESTNET ? 4 : 1;
