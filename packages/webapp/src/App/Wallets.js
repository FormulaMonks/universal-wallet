import React, { Component, Fragment } from 'react';
import {
  NavHeader,
  WalletsStore,
  CoinsStore,
  ImgFromSymbol,
} from '../components';
import { generateWallet, AVAILABLE_WALLET_GENERATORS } from '../utils/wallets';

const getWalletValues = ({
  inputPrivateKey,
  inputPublicAddress,
  inputAlias,
  inputBalanceURL,
  inputBalanceProp,
  inputBalanceUnit,
  inputTransactionsURL,
  inputTransactionsProp,
  inputSymbol,
}) => {
  return {
    privateKey: inputPrivateKey.value,
    publicAddress: inputPublicAddress.value,
    alias: inputAlias.value,
    balanceURL: inputBalanceURL.value,
    balanceProp: inputBalanceProp.value,
    balanceUnit: inputBalanceUnit.value,
    transactionsURL: inputTransactionsURL.value,
    transactionsProp: inputTransactionsProp.value,
    symbol: inputSymbol.value,
  };
};

class Form extends Component {
  render() {
    const { btnLabel, coins, onCancel, defaultValues = {} } = this.props;
    const {
      privateKey = '',
      publicAddress = '',
      alias = '',
      transactionsURL = '',
      transactionsProp = '',
      balanceURL = '',
      balanceProp = '',
      balanceUnit = '',
      symbol = '',
    } = defaultValues;
    return (
      <form
        ref={f => (this.form = f)}
        onSubmit={this.onSubmit}
        key={Date.now()}
      >
        <input type="submit" value={btnLabel} />
        {onCancel && <button onClick={onCancel}>Cancel</button>}
        <input
          placeholder="Private Key (unencrypted)"
          type="password"
          name="inputPrivateKey"
          required
          defaultValue={privateKey}
        />
        <input
          placeholder="Public Address"
          type="text"
          name="inputPublicAddress"
          required
          defaultValue={publicAddress}
        />
        <input
          placeholder="Alias"
          type="text"
          name="inputAlias"
          required
          defaultValue={alias}
        />
        <input
          placeholder="Balance URL"
          type="text"
          name="inputBalanceURL"
          defaultValue={balanceURL}
        />
        <input
          placeholder="Balance Prop"
          type="text"
          name="inputBalanceProp"
          defaultValue={balanceProp}
        />
        <input
          placeholder="Balance Unit"
          type="text"
          name="inputBalanceUnit"
          defaultValue={balanceUnit}
        />
        <input
          placeholder="Transactions URL"
          type="text"
          name="inputTransactionsURL"
          defaultValue={transactionsURL}
        />
        <input
          placeholder="Transactions Prop"
          type="text"
          name="inputTransactionsProp"
          defaultValue={transactionsProp}
        />
        <select name="inputSymbol" required defaultValue={symbol}>
          <option key="wallets-coins-label" disabled value="" hidden>
            Coin
          </option>
          {coins.map(({ name, symbol }, index) => {
            return (
              <option key={`wallets-coins-${index}`} value={symbol}>
                {symbol} - {name}
              </option>
            );
          })}
        </select>
      </form>
    );
  }

  onSubmit = e => {
    e.preventDefault();
    this.props.onSubmit(this.form);
  };
}

class Wallets extends Component {
  state = { newWallet: null };

  render() {
    const {
      coins,
      coinsError,
      coinsLoading,
      wallet,
      wallets,
      walletsError,
      walletsLoading,
    } = this.props;
    const { newWallet } = this.state;

    return (
      <Fragment>
        {coinsError}
        {walletsError}
        {wallet ? (
          <Form
            defaultValues={{ ...wallet }}
            coins={coins}
            onCancel={this.onEditCancel}
            onSubmit={this.onEdit}
            btnLabel={'Save'}
          />
        ) : (
          <Fragment>
            <button onClick={this.onGenerate}>Generate new Wallet</button>
            <select
              defaultValue=""
              onChange={this.onSelectCoinWalletGenerationChange}
            >
              <option
                key="generate-wallet-coins-default"
                disabled
                value=""
                hidden
              >
                Choose coin
              </option>
              {AVAILABLE_WALLET_GENERATORS.map(({ name, symbol }) => (
                <option key={`generate-wallet-coins-${symbol}`} value={symbol}>
                  {name} ({symbol.toUpperCase()})
                </option>
              ))}
            </select>
            <Form
              coins={coins}
              onSubmit={this.onNew}
              btnLabel={'Add new'}
              defaultValues={{ ...newWallet }}
            />
          </Fragment>
        )}
        {coinsLoading || walletsLoading ? (
          <div>loading</div>
        ) : (
          <ul>
            {wallets.map(
              ({ id, createdAt, lastModified, alias, symbol }, index) => {
                const { name } = coins.find(
                  item => item.symbol.toLowerCase() === symbol.toLowerCase(),
                );
                const created = new Date(createdAt);
                const modified = new Date(lastModified);
                return (
                  <li key={`wallets-${id}`}>
                    <button onClick={() => this.onWalletPick(id)}>Edit</button>
                    <ImgFromSymbol coins={coins} symbol={symbol} />
                    <div>{alias}</div>
                    <div>
                      {name} ({symbol})
                    </div>
                    <div>created {created.toDateString()}</div>
                    <div>last modified {modified.toDateString()}</div>
                    <button onClick={() => this.onDelete(id)}>Delete</button>
                  </li>
                );
              },
            )}
          </ul>
        )}
      </Fragment>
    );
  }

  onDelete = async id => {
    const msg =
      'You are about to delete a Wallet, this action cannot be undone. Are you sure?';
    if (window.confirm(msg)) {
      await this.props.walletsDelete(id);
    }
  };

  onEdit = async form => {
    await this.props.walletsPut(this.props.wallet.id, getWalletValues(form));
    form.reset();
  };

  onEditCancel = e => {
    e.preventDefault();
    this.props.walletRelease();
  };

  onGenerate = async () => {
    const { newSymbol } = this.state;
    if (!newSymbol) {
      return;
    }

    const {
      privateKey,
      publicAddress,
      symbol: lowerCasedSymbol,
    } = generateWallet(newSymbol.toLowerCase());
    const symbol = lowerCasedSymbol.toUpperCase();
    const newWallet = {
      privateKey,
      publicAddress,
      symbol,
      alias: `A new ${
        process.env.REACT_APP_TESTNET ? '(testnet) ' : ' '
      }${symbol} Wallet (${new Date().toLocaleString()})`,
    };
    this.setState({ newWallet });
  };

  onNew = async form => {
    await this.props.walletsPost(getWalletValues(form));
    this.setState({ newWallet: null });
    form.reset();
  };

  onSelectCoinWalletGenerationChange = e => {
    this.setState({ newSymbol: e.currentTarget.value });
  };

  onWalletPick = walletId => {
    this.setState({ newWallet: null });
    this.props.walletPick(walletId);
  };
}

export default () => (
  <Fragment>
    <NavHeader />
    <CoinsStore>
      <WalletsStore>
        <Wallets />
      </WalletsStore>
    </CoinsStore>
  </Fragment>
);
