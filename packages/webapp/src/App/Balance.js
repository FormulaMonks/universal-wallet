import React, { Component, Fragment } from 'react';
import qr from 'qr-encode';
import { Header, Balance as BalanceHOC } from '../components';
import { WalletsStore } from '../stores';

const WalletBalanceWrap = ({ wallet }) => {
  const { publicAddress } = wallet;
  return (
    <Fragment>
      <BalanceHOC wallet={wallet}>
        <WalletBalance />
      </BalanceHOC>
      {publicAddress && (
        <Fragment>
          <div>
            <img src={qr(publicAddress)} alt="QR code public address" />
          </div>
          <div>{publicAddress}</div>
        </Fragment>
      )}
    </Fragment>
  );
};

const WalletBalance = ({
  balance,
  balanceCurrency,
  balanceCurrencyLoading,
  balanceError,
  balanceErrorCurrency,
  balanceHas,
  balanceLoading,
}) => {
  return (
    <Fragment>
      {balanceError}
      {balanceErrorCurrency}
      {balanceHas && (
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
    </Fragment>
  );
};

class Balance extends Component {
  state = { selectedWallet: null };

  componentDidMount() {
    //this.fetchWallets().then(() => {
    //const { wallets } = this.state;
    //if (wallets.length) {
    //const { id } = wallets.sort(
    //(a, b) => b.lastModified - a.lastModified,
    //)[0];
    //this.walletSelect.value = id;
    //this.onWalletChange(id);
    //}
    //});
  }

  render() {
    const { wallets, walletsError, walletsLoading } = this.props;
    const { selectedWallet } = this.state;

    return (
      <Fragment>
        {walletsError}
        <div>
          {walletsLoading ? (
            <div>loading</div>
          ) : (
            <select
              defaultValue=""
              onChange={this.onWalletChange}
              ref={s => (this.select = s)}
            >
              <option disabled value="" hidden>
                Wallet
              </option>
              {wallets.map(({ id, alias }) => (
                <option key={`wallets-${id}`} value={id}>
                  {alias}
                </option>
              ))}
            </select>
          )}
          {selectedWallet && (
            <WalletBalanceWrap
              wallet={wallets.find(({ id }) => id === selectedWallet)}
            />
          )}
        </div>
      </Fragment>
    );
  }

  onWalletChange = () => {
    this.setState({ selectedWallet: this.select.value });
  };
}

export default () => (
  <Fragment>
    <Header />
    <WalletsStore>
      <Balance />
    </WalletsStore>
  </Fragment>
);
