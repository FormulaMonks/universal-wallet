import React, { Component, Fragment } from 'react';
import { getFile, putFile } from 'blockstack';
import uuid from 'uuid';
import { Header } from '../../components';

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
    const { btnLabel, currencies, defaultValues = {} } = this.props;
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
        <input
          placeholder="Private Key (unencrypted)"
          type="text"
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
          <option disabled value="" hidden>
            Currency
          </option>
          {currencies.map(({ name, symbol }, index) => {
            return (
              <option key={`wallets-currencies-${index}`} value={symbol}>
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

export default class Wallets extends Component {
  state = {
    list: [],
    currencies: [],
    currenciesError: null,
    listError: null,
    loading: true,
    editWallet: null,
  };

  componentDidMount() {
    this.fetchCurrencies();
    this.fetchWallets();
  }

  render() {
    const {
      list,
      currencies,
      currenciesError,
      listError,
      loading,
      editWallet,
    } = this.state;
    const sortedList = list.sort((a, b) => b.lastModified - a.lastModified);
    return (
      <Fragment>
        <Header />
        <div>
          {currenciesError && (
            <div>
              There was an error fetching the available currencies:{' '}
              {currenciesError}
            </div>
          )}
          {listError && (
            <div>There was an error fetching the wallets: {listError}</div>
          )}
          {editWallet ? (
            <Form
              defaultValues={{ ...list.find(({ id }) => id === editWallet) }}
              currencies={currencies}
              onSubmit={this.onEdit}
              btnLabel={'Save'}
            />
          ) : (
            <Form
              currencies={currencies}
              onSubmit={this.onNew}
              btnLabel={'Add new'}
            />
          )}
          {loading ? (
            <div>loading</div>
          ) : (
            <ul>
              {sortedList.map(
                ({ id, createdAt, lastModified, alias, symbol }, index) => {
                  const { name, imageSmall } = currencies.find(
                    item => item.symbol === symbol,
                  );
                  const created = new Date(createdAt);
                  const modified = new Date(lastModified);
                  return (
                    <li key={`wallets-${id}`}>
                      <button onClick={() => this.setState({ editWallet: id })}>
                        Edit
                      </button>
                      <img alt={`${name}`} src={imageSmall} />
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
        </div>
      </Fragment>
    );
  }

  fetchCurrencies = async () => {
    try {
      const res = await fetch('https://shapeshift.io/getcoins');
      const currencies = await res.json();
      this.setState({ currencies: Object.values(currencies) });
    } catch (e) {
      this.setState({ currenciesError: e.toString() });
    }
  };

  fetchWallets = async () => {
    this.setState({ loading: true });

    try {
      const file = await getFile('wallets.json');
      const list = JSON.parse(file || '[]');
      this.setState({ list, loading: false });
    } catch (e) {
      this.setState({ listError: e.toString() });
    }
  };

  onDelete = async id => {
    this.setState({ loading: true });

    const newList = this.state.list.filter(item => item.id !== id);
    await putFile('wallets.json', JSON.stringify(newList));
    this.fetchWallets();
  };

  onEdit = async form => {
    this.setState({ loading: true });

    const { list, editWallet } = this.state;
    const current = list.find(({ id }) => id === editWallet);
    const { id, createdAt, lastModified, ...values } = getWalletValues(form);
    const newList = [
      ...list.filter(({ id }) => id !== editWallet),
      { ...current, ...values, lastModified: Date.now() },
    ];
    await putFile('wallets.json', JSON.stringify(newList));
    form.reset();
    this.fetchWallets();
  };

  onNew = async form => {
    this.setState({ loading: true });

    const values = getWalletValues(form);
    const newList = [
      ...this.state.list,
      {
        id: uuid(),
        createdAt: Date.now(),
        lastModified: Date.now(),
        ...values,
      },
    ];
    await putFile('wallets.json', JSON.stringify(newList));
    form.reset();
    this.fetchWallets();
  };
}
