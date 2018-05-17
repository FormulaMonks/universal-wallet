import React, { Component, Fragment } from 'react';
import qr from 'qr-encode';
import { Header } from '../../components';
import { getFile } from 'blockstack';
import {
  WALLETS_JSON,
  BTC_TO_USD,
  SHAPESHIFT_MARKETINFO,
} from '../../../utils/constants';

const Wallet = ({
  balance,
  balanceCurrency,
  balanceCurrencyLoading,
  balanceLoading,
  balanceLoadingError,
  wallet: { publicAddress, balanceURL, balanceProp, balanceUnit },
}) => {
  return (
    <div>
      {!balanceLoadingError &&
        balanceURL &&
        balanceProp &&
        balanceURL && (
          <Fragment>
            <div>Balance</div>
            {balanceLoading ? <div>loading</div> : <div>{balance}</div>}
            {balanceCurrencyLoading ? (
              <div>loading</div>
            ) : (
              <div>{balanceCurrency} USD</div>
            )}
          </Fragment>
        )}
      <div>
        <img src={qr(publicAddress)} alt="QR code public address" />
      </div>
      <div>{publicAddress}</div>
    </div>
  );
};

export default class Balance extends Component {
  state = {
    walletBalance: 0,
    walletBalanceCurrency: 0,
    walletBalanceCurrencyLoading: true,
    walletBalanceError: null,
    walletBalanceLoading: true,
    wallets: [],
    walletsError: null,
    walletsLoading: true,
    walletsSelected: null,
  };

  componentDidMount() {
    this.fetchWallets().then(() => {
      const { wallets } = this.state;
      if (wallets.length) {
        const { id } = wallets.sort(
          (a, b) => b.lastModified - a.lastModified,
        )[0];
        this.walletSelect.value = id;
        this.onWalletChange(id);
      }
    });
  }

  render() {
    const {
      walletBalance,
      walletBalanceCurrency,
      walletBalanceCurrencyLoading,
      walletBalanceError,
      walletBalanceLoading,
      wallets,
      walletsError,
      walletsLoading,
      walletsSelected,
    } = this.state;

    return (
      <Fragment>
        <Header />
        {walletsError && (
          <div>There was an error fetching the wallets: {walletsError}</div>
        )}
        {walletBalanceError && (
          <div>
            There was an error fetching the wallet balance: {walletBalanceError}
          </div>
        )}
        <div>
          {walletsLoading ? (
            <div>loading</div>
          ) : (
            <select
              defaultValue=""
              onChange={this.onWalletChange}
              ref={n => (this.walletSelect = n)}
            >
              <option disabled value="" hidden>
                Wallet
              </option>
              {wallets.map(({ id, alias }) => {
                return (
                  <option key={`wallets-${id}`} value={id}>
                    {alias}
                  </option>
                );
              })}
            </select>
          )}
          {!walletsSelected ? (
            <div>loading</div>
          ) : (
            <Wallet
              balance={walletBalance}
              balanceCurrency={walletBalanceCurrency}
              balanceCurrencyLoading={walletBalanceCurrencyLoading}
              balanceLoadingError={walletBalanceError}
              balanceLoading={walletBalanceLoading}
              wallet={wallets.find(w => w.id === walletsSelected)}
            />
          )}
        </div>
      </Fragment>
    );
  }

  fetchBalance = async id => {
    const {
      publicAddress,
      balanceURL,
      balanceProp,
      balanceUnit,
    } = this.state.wallets.find(i => i.id === id);
    if (!balanceURL || !balanceProp || !balanceUnit) {
      return;
    }
    try {
      const res = await fetch(`${balanceURL}${publicAddress}`);
      const data = await res.json();
      if (!data.hasOwnProperty(balanceProp)) {
        this.setState({
          walletBalanceError:
            'The response did not include the balance property',
        });
        return;
      }
      this.setState({
        walletBalance: data[balanceProp] * balanceUnit,
        walletBalanceLoading: false,
      });
    } catch (e) {
      this.setState({ walletBalanceError: e.toString() });
    }
  };

  fetchBalanceCurrency = async id => {
    // if not BTC get value in BTC
    const { wallets, walletBalance } = this.state;
    const { symbol } = wallets.find(i => i.id === id);
    const symbolCased = symbol.toLowerCase()
    let toBTC = 1;
    if (symbolCased !== 'btc') {
      const res = await fetch(`${SHAPESHIFT_MARKETINFO}${symbolCased}_btc`);
      const { rate } = await res.json();
      toBTC = rate;
    }
    const rate = await fetch(BTC_TO_USD);
    const { last: toUSD } = await rate.json();
    const walletBalanceCurrency = walletBalance * toBTC * toUSD;

    this.setState({
      walletBalanceCurrency,
      walletBalanceCurrencyLoading: false,
    });
  };

  fetchWallets = async () => {
    try {
      const file = await getFile(WALLETS_JSON);
      const wallets = JSON.parse(file || '[]');
      this.setState({ wallets, walletsLoading: false });
    } catch (e) {
      this.setState({ walletsError: e });
    }
  };

  onWalletChange = () => {
    this.setState({
      walletBalance: 0,
      walletBalanceCurrency: 0,
      walletBalanceCurrencyLoading: true,
      walletBalanceError: null,
      walletBalanceLoading: true,
      walletsSelected: null,
    });
    this.selectWallet(this.walletSelect.value);
  };

  selectWallet = async id => {
    await this.fetchBalance(id);
    await this.fetchBalanceCurrency(id);
    this.setState({ walletsSelected: id });
  };
}
