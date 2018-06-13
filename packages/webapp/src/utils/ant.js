import EthereumTx from 'ethereumjs-tx';
import ABI from './abi';
import {
  balanceURL,
  transactionsURL,
  CHAIN_ID,
  eth,
  utils,
  sendTx,
  fromWif as fromWifEth,
  generateWallet as generateWalletEth,
} from './eth';

const UNIT = 1e-18;

const toAmount = t => t * UNIT;

const toTokens = a => a / UNIT;

const CONTRACT_ADDRESS = process.env.REACT_APP_TESTNET
  ? '0x0d5263b7969144a852d58505602f630f9b20239d'
  : '0x960b236A07cf122663c4303350609A66A7B288C0';

export { toWif, validateAddress } from './eth';

export const NAME = 'Aragon';

export const SYMBOL = 'ant';

export const DEFAULTS = {
  balanceURL,
  balanceProp: 'result',
  balanceUnit: UNIT,
  transactionsURL,
  transactionsProp: 'result',
  symbol: SYMBOL,
};

export const fromWif = wif => {
  const { privateKey, publicAddress } = fromWifEth(wif);
  return {
    privateKey,
    publicAddress,
    ...DEFAULTS,
  };
};

export const generateWallet = () => {
  const { privateKey, publicAddress } = generateWalletEth();

  return {
    privateKey,
    publicAddress,
    ...DEFAULTS,
  };
};

export const getTxInfo = async ({ to, from, amount }) => {
  const priceInWei = await eth.getGasPrice();
  const contract = new eth.Contract(ABI, CONTRACT_ADDRESS, { from });
  const gasLimitInWei = await contract.methods
    .transfer(to, toTokens(amount))
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

export const generateTx = async ({ to, from, privateKey: rawPK, amount }) => {
  const privateKey = rawPK.indexOf('0x') === 0 ? rawPK.substr(2) : rawPK;
  const nonce = await eth.getTransactionCount(from);
  const gasPriceInWei = await eth.getGasPrice();
  const contract = new eth.Contract(ABI, CONTRACT_ADDRESS, { from });
  const gasLimitInWei = await contract.methods
    .transfer(to, toTokens(amount))
    .estimateGas();
  const tx = new EthereumTx({
    to: CONTRACT_ADDRESS,
    from,
    nonce: utils.toHex(nonce),
    gasPrice: utils.toHex(gasPriceInWei),
    gasLimit: utils.toHex(gasLimitInWei),
    chainId: CHAIN_ID,
    value: '0x0',
    data: contract.methods
      .transfer(to, utils.toHex(toTokens(amount)))
      .encodeABI(),
  });
  tx.sign(Buffer.from(privateKey, 'hex'));
  return tx.serialize();
};

export const broadcast = async params => {
  const tx = await generateTx(params);
  return await sendTx(tx);
};

export const getBalance = async publicAddress => {
  const contract = new eth.Contract(ABI, CONTRACT_ADDRESS, {
    from: publicAddress,
  });
  const tokens = await contract.methods.balanceOf(publicAddress).call();
  return toAmount(tokens);
};
