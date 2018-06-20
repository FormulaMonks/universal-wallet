import EthereumTx from 'ethereumjs-tx';
import {
  sendTx,
  eth,
  utils,
  toPublicAddress,
  CHAIN_ID,
  URL_TX,
} from './eth';
import ABI from './abi';
import { transactionsURL } from './erc20'

const toTokens = (decimals, a) => a * 10 ** decimals;

export { validateAddress, toPublicAddress } from './eth';

export const getBalance = async ({
  privateKey,
  token: { contract: contractAddress, decimals },
}) => {
  const from = toPublicAddress(privateKey);
  const contract = new eth.Contract(ABI, contractAddress, { from });
  const tokens = await contract.methods.balanceOf(from).call();
  return tokens * 1 / 10 ** decimals;
};

export const broadcast = async params => {
  const tx = await generateTx(params);
  return await sendTx(tx);
};

export const generateTx = async ({
  to,
  from,
  privateKey: rawPK,
  amount,
  token: { contract: contractAddress, decimals },
}) => {
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

export const getTxInfo = async ({
  to,
  from,
  amount,
  token: { contract: contractAddress, decimals },
}) => {
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

/* transactions */
export const getTransactions = symbol => async ({
  privateKey,
  token: { contract },
}) => {
  const raw = await fetch(
    `${transactionsURL}&address=${toPublicAddress(
      privateKey,
    )}&contractaddress=${contract}`,
  );
  const { result } = await raw.json();
  if (!Array.isArray(result)) {
    throw new Error(result);
  }
  return result;
};

/* transaction url */
export const getTransactionURL = symbol => URL_TX
