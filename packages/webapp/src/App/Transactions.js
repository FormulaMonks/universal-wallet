import React, { Component, Fragment } from 'react';
import { WalletsStore, TransactionsStore } from '../stores';
import { Header } from '../components';

class Transactions extends Component {
  render() {
    const {
      wallet,
      wallets,
      walletsError,
      walletsLoading,
      transactions,
      transactionsHas,
      transactionsLoading,
      transactionsError,
    } = this.props;

    return (
      <Fragment>
        {walletsError}
        {transactionsError}
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
          {wallet &&
            transactionsHas && (
              <Fragment>
                {transactionsLoading ? (
                  <div>loading</div>
                ) : (
                  <Fragment>
                    <ul>
                      {transactions.map(t => {
                        return <li key={`transactions-${t}`}>{t}</li>;
                      })}
                    </ul>
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
      this.select.value = id;
      walletPick(id);
    }
  };
}

export default () => {
  return (
    <Fragment>
      <Header />
      <WalletsStore>
        <TransactionsStore>
          <Transactions />
        </TransactionsStore>
      </WalletsStore>
    </Fragment>
  );
};
