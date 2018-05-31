import Web3 from 'web3';
import EthereumTx from 'ethereumjs-tx';
import { ETHER_SYMBOL_LOWER_CASED } from './constants';

const INFURA_URL = process.env.REACT_APP_TESTNET
  ? 'https://rinkeby.infura.io/'
  : 'https://mainnet.infura.io/';
const INFURA_NETWORK = `${INFURA_URL}${process.env.REACT_APP_INFURA_API_KEY}`;
// chainId - mainnet: 1, rinkeby: 4
const INFURA_CHAIN_ID = process.env.REACT_APP_TESTNET ? 4 : 1;
const GAS_LIMIT_IN_WEI = 21000;
const { eth, utils } = new Web3(
  new Web3.providers.HttpProvider(INFURA_NETWORK),
);
const chainId = INFURA_CHAIN_ID;
const sendTx = async tx =>
  new Promise((resolve, reject) =>
    eth.sendSignedTransaction(`0x${tx.toString('hex')}`, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    }),
  );

export const createAccount = () => eth.accounts.create();

export const getTxInfo = async () => {
  const priceInWei = await eth.getGasPrice();
  const aproxFeeInWei = GAS_LIMIT_IN_WEI * priceInWei;
  return {
    wei: {
      price: priceInWei,
      limit: GAS_LIMIT_IN_WEI,
      aproxFee: aproxFeeInWei,
    },
    ether: {
      limit: utils.fromWei(`${GAS_LIMIT_IN_WEI}`, 'ether'),
      price: utils.fromWei(`${priceInWei}`, 'ether'),
      aproxFee: utils.fromWei(`${aproxFeeInWei}`, 'ether'),
    },
    gwei: {
      limit: utils.fromWei(`${GAS_LIMIT_IN_WEI}`, 'gwei'),
      price: utils.fromWei(`${priceInWei}`, 'gwei'),
      aproxFee: utils.fromWei(`${aproxFeeInWei}`, 'gwei'),
    },
  };
};

export const validateAddress = utils.isAddress;

export const generateTx = async ({ to, from, privateKey: rawPK, amount }) => {
  const privateKey = rawPK.indexOf('0x') === 0 ? rawPK.substr(2) : rawPK;
  const nonce = await eth.getTransactionCount(from);
  const valueInWei = utils.toWei(`${amount}`, 'ether');
  const gasPriceInWei = await eth.getGasPrice();
  const tx = new EthereumTx({
    to,
    from,
    nonce: utils.toHex(nonce),
    value: utils.toHex(valueInWei),
    gasPrice: utils.toHex(gasPriceInWei),
    gasLimit: utils.toHex(GAS_LIMIT_IN_WEI),
    chainId,
  });
  tx.sign(Buffer.from(privateKey, 'hex'));
  return tx.serialize();
};

export const broadcast = async params => {
  const tx = await generateTx(params);
  return await sendTx(tx);
};
