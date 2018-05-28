import Web3 from 'web3';
import EthereumTx from 'ethereumjs-tx';
import { INFURA_NETWORK, INFURA_CHAIN_ID } from '../utils/constants';

const { eth, utils } = new Web3(
  new Web3.providers.HttpProvider(INFURA_NETWORK),
);
const chainId = INFURA_CHAIN_ID;
const sendTx = async tx =>
  new Promise(r =>
    eth.sendSignedTransaction(`0x${tx.toString('hex')}`, (err, res) => {
      if (err) {
        throw err;
      }
      r(res);
    }),
  );

export const getTxInfo = async () => {
  const { gasLimit: gasLimitInWei, gasUsed: gasUsedInWei } = await eth.getBlock(
    'latest',
  );
  const priceInWei = await eth.getGasPrice();
  const maxFeeInWei = gasLimitInWei * priceInWei;
  const aproxFeeInWei = gasUsedInWei * priceInWei;
  return {
    wei: {
      price: priceInWei,
      limit: gasLimitInWei,
      maxFee: maxFeeInWei,
      aproxFee: aproxFeeInWei,
    },
    ether: {
      limit: utils.fromWei(`${gasLimitInWei}`, 'ether'),
      price: utils.fromWei(`${priceInWei}`, 'ether'),
      maxFee: utils.fromWei(`${maxFeeInWei}`, 'ether'),
      aproxFee: utils.fromWei(`${aproxFeeInWei}`, 'ether'),
    },
    gwei: {
      limit: utils.fromWei(`${gasLimitInWei}`, 'gwei'),
      price: utils.fromWei(`${priceInWei}`, 'gwei'),
      maxFee: utils.fromWei(`${maxFeeInWei}`, 'gwei'),
      aproxFee: utils.fromWei(`${aproxFeeInWei}`, 'gwei'),
    },
  };
};

export const validateAddress = utils.isAddress;

export const generateTx = async ({ to, from, privateKey, amount }) => {
  const nonce = await eth.getTransactionCount(from);
  const valueInWei = utils.toWei(`${amount}`, 'ether');
  const gasPriceInWei = await eth.getGasPrice();
  const { gasLimit: gasLimitInWei } = await eth.getBlock('latest');
  const tx = new EthereumTx({
    to,
    from,
    nonce: utils.toHex(nonce),
    value: utils.toHex(valueInWei),
    gasPrice: utils.toHex(gasPriceInWei),
    gasLimit: utils.toHex(gasLimitInWei),
    chainId,
  });
  tx.sign(Buffer.from(privateKey, 'hex'));
  return tx.serialize();
};

export const broadcast = async params => {
  const tx = await generateTx(params);
  return await sendTx(tx);
};
