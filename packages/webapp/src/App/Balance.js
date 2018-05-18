import React, { Component, Fragment } from 'react';
import qr from 'qr-encode';
import { Header, Balance as BalanceHOC } from '../components';
import { WalletsStore } from '../stores';

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
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.wallets.length !== prevState.prevLength) {
      return {
        prevLength: nextProps.wallets.length,
      };
    }
    return null;
  }

  state = {};

  componentDidMount() {
    this.pickWallet();
  }

  componentDidUpdate(prevProps) {
    if (this.props.wallet === null) {
      this.pickWallet();
    }
  }

  render() {
    const { wallet, wallets, walletsError, walletsLoading } = this.props;

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
          {wallet && (
            <Fragment>
              <BalanceHOC wallet={wallet}>
                <WalletBalance />
              </BalanceHOC>
              {wallet.publicAddress && (
                <Fragment>
                  <div>
                    <img
                      src={qr(wallet.publicAddress)}
                      alt="QR code public address"
                    />
                  </div>
                  <div>{wallet.publicAddress}</div>
                </Fragment>
              )}
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  }

  onWalletChange = () => {
    this.props.walletPick(this.select.value);
  };

  pickWallet = () => {
    const { wallets, walletPick } = this.props;
    if (wallets.length) {
      const { id } = wallets.sort((a, b) => b.lastModified - a.lastModifie)[0];
      this.select.value = id
      walletPick(id);
    }
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
