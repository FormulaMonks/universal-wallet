import EthereumTx from 'ethereumjs-tx';
import ABI from './abi';
import {
  DEFAULTS,
  CHAIN_ID,
  eth,
  utils,
  sendTx,
  generateWallet,
  fromWif as fromWifEth,
} from './eth';

const TESTNET = process.env.REACT_APP_TESTNET;

const toTokens = (decimals, a) => a * 10 ** decimals;

export const TOKENS = {
  zrx: {
    contract: TESTNET
      ? '0x00F58D6d585F84B2d7267940CeDe30Ce2FE6eAE8'
      : '0xe41d2489571d322189246dafa5ebde1f4699f498',
    decimals: 18,
    name: '0x',
  },
  ant: {
    decimals: 18,
    contract: '0x960b236A07cf122663c4303350609A66A7B288C0',
    name: 'Aragon',
  },
};

export { validateAddress, toWif } from './eth';

export const broadcast = async params => {
  const tx = await generateTx(params);
  return await sendTx(tx);
};

export const generateTx = async ({ symbol, to, from, privateKey: rawPK, amount }) => {
  const { contract: contractAddress, decimals } = TOKENS[symbol];
  const privateKey = rawPK.indexOf('0x') === 0 ? rawPK.substr(2) : rawPK;
  const nonce = await eth.getTransactionCount(from);
  const gasPriceInWei = await eth.getGasPrice();
  const contract = new eth.Contract(ABI, contractAddress, { from });
  const gasLimitInWei = await contract.methods
    .transfer(to, toTokens(decimals, amount))
    .estimateGas();
  const tx = new EthereumTx({
    to: contractAddress,
    from,
    nonce: utils.toHex(nonce),
    gasPrice: utils.toHex(gasPriceInWei),
    gasLimit: utils.toHex(gasLimitInWei),
    chainId: CHAIN_ID,
    value: '0x0',
    data: contract.methods
      .transfer(to, utils.toHex(toTokens(decimals, amount)))
      .encodeABI(),
  });
  tx.sign(Buffer.from(privateKey, 'hex'));
  return tx.serialize();
};

export const getTxInfo = async ({ to, from, amount, symbol }) => {
  const { contract: contractAddress, decimals } = TOKENS[symbol];
  const priceInWei = await eth.getGasPrice();
  const contract = new eth.Contract(ABI, contractAddress, { from });
  const gasLimitInWei = await contract.methods
    .transfer(to, toTokens(decimals, amount))
    .estimateGas();
  const aproxFeeInWei = gasLimitInWei * priceInWei;

  return {
    wei: {
      price: priceInWei,
      limit: gasLimitInWei,
      aproxFee: aproxFeeInWei,
    },
    ether: {
      limit: utils.fromWei(`${gasLimitInWei}`, 'ether'),
      price: utils.fromWei(`${priceInWei}`, 'ether'),
      aproxFee: utils.fromWei(`${aproxFeeInWei}`, 'ether'),
    },
    gwei: {
      limit: utils.fromWei(`${gasLimitInWei}`, 'gwei'),
      price: utils.fromWei(`${priceInWei}`, 'gwei'),
      aproxFee: utils.fromWei(`${aproxFeeInWei}`, 'gwei'),
    },
  };
};

export const generate = symbol => () => {
  const {
    symbol: ethSymbol,
    balanceUnit: ethBalanceUnit,
    ...rest
  } = generateWallet();
  return { ...rest, symbol, balanceUnit: 1 / 10 ** TOKENS[symbol].decimals };
};

export const fromWif = symbol => wif => {
  const {
    symbol: ethSymbol,
    balanceUnit: ethBalanceUnit,
    ...rest
  } = fromWifEth(wif);
  return { ...rest, symbol, balanceUnit: 1 / 10 ** TOKENS[symbol].decimals };
};

export const defaults = symbol => {
  const { symbol: ethSymbol, balanceUnit: ethBalanceUnit, ...rest } = DEFAULTS;
  return { ...rest, symbol, balanceUnit: 1 / 10 ** TOKENS[symbol].decimals };
};

export const getBalance = symbol => async from => {
  const { contract: contractAddress, decimals } = TOKENS[symbol];
  const contract = new eth.Contract(ABI, contractAddress, { from });
  const tokens = await contract.methods.balanceOf(from).call();
  return tokens * 1 / 10 ** decimals;
};
