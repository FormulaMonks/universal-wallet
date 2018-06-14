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
  ant: {
    decimals: 18,
    contract: '0x960b236A07cf122663c4303350609A66A7B288C0',
    name: 'Aragon',
  },
  adt: {
    name: 'adToken',
    decimals: 9,
    contract: '0xd0d6d6c5fe4a677d343cc433536bb717bae167dd',
  },
  arn: {
    name: 'Aeron',
    decimals: 8,
    contract: '0xBA5F11b16B155792Cf3B2E6880E8706859A8AEB6',
  },
  ae: {
    name: 'Aeternity',
    decimals: 18,
    contract: '0x5CA9a71B1d01849C0a95490Cc00559717fCF0D1d',
  },
  '1st': {
    name: 'FirstBlood',
    decimals: 18,
    contract: '0xaf30d2a7e90d7dc361c8c4585e9bb7d2f6f15bc7',
  },
  bat: {
    name: 'Basic Attention',
    decimals: 18,
    contract: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  },
  bnt: {
    name: 'Bancor',
    decimals: 18,
    contract: '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c',
  },
  cvc: {
    name: 'Civic',
    decimals: 8,
    contract: '0x41e5560054824ea6b0732e656e3ad64e20e94e45',
  },
  dnt: {
    name: 'district0x',
    decimals: 18,
    contract: '0x0abdace70d3790235af448c88547603b945604ea',
  },
  edg: {
    name: 'Edgeless',
    decimals: 0,
    contract: '0x08711d3b02c8758f2fb3ab4e80228418a7f8e39c',
  },
  eos: {
    name: 'Eos',
    decimals: 18,
    contract: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0',
  },
  gno: {
    name: 'Gnosis',
    decimals: 18,
    contract: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  },
  gnt: {
    name: 'Golem',
    decimals: 18,
    contract: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
  },
  gup: {
    name: 'Matchpool',
    decimals: 3,
    contract: '0xf7b098298f7c69fc14610bf71d5e02c60792894c',
  },
  nmr: {
    name: 'Numeraire',
    decimals: 18,
    contract: '0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671',
  },
  omg: {
    name: 'OmiseGo',
    decimals: 18,
    contract: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
  },
  qtum: {
    name: 'Qtum',
    decimals: 18,
    contract: '0x9a642d6b3368ddc662CA244bAdf32cDA716005BC',
  },
  rep: {
    name: 'Augur',
    decimals: 18,
    contract: '0xe94327d07fc17907b4db788e5adf2ed424addff6',
  },
  rcn: {
    name: 'RCN (RipioCreditNetwork)',
    decimals: 18,
    contract: '0xF970b8E36e23F7fC3FD752EeA86f8Be8D83375A6',
  },
  rlc: {
    name: 'iExec RLC',
    decimals: 9,
    contract: '0x607F4C5BB672230e8672085532f7e901544a7375',
  },
  salt: {
    name: 'Salt',
    decimals: 8,
    contract: '0x4156D3342D5c385a87D264F90653733592000581',
  },
  snt: {
    name: 'Status',
    decimals: 18,
    contract: '0x744d70fdbe2ba4cf95131626614a1763df805b9e',
  },
  storj: {
    name: 'Storj',
    decimals: 8,
    contract: '0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac',
  },
  swt: {
    name: 'Swarm City',
    decimals: 18,
    contract: '0xb9e7f8568e08d5659f5d29c4997173d84cdf2607',
  },
  trst: {
    name: 'TrustCoin/WeTrust',
    decimals: 6,
    contract: '0xcb94be6f13a1182e4a4b6140cb7bf2025d28e41b',
  },
  wings: {
    name: 'Wings',
    decimals: 18,
    contract: '0x667088b212ce3d06a1b553a7221E1fD19000d9aF',
  },
  zrx: {
    contract: TESTNET
      ? '0x00F58D6d585F84B2d7267940CeDe30Ce2FE6eAE8'
      : '0xe41d2489571d322189246dafa5ebde1f4699f498',
    decimals: 18,
    name: '0x',
  },
};

export { validateAddress, toWif } from './eth';

export const broadcast = async params => {
  const tx = await generateTx(params);
  return await sendTx(tx);
};

export const generateTx = async ({
  symbol,
  to,
  from,
  privateKey: rawPK,
  amount,
}) => {
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
