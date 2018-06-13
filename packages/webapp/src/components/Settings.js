import React, { Component } from 'react';
import styled from 'styled-components';
import { Center, StickySummary, Leaders, Dots, Button } from '../theme';
import { Form, CoinsView } from './';

const Centered = Center.extend`
  margin: 2em auto;
`;

const H4 = styled.h4`
  display: inline-block;
`;

const getWalletValues = ({
  inputPrivateKey,
  inputPublicAddress,
  inputAlias,
  inputBalanceURL,
  inputBalanceProp,
  inputBalanceUnit,
  inputTransactionsURL,
  inputTransactionsProp,
  selectSymbol,
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
    symbol: selectSymbol.value,
  };
};

const didSomethingChange = (newObj, obj) => {
  return Object.keys(newObj).reduce((p, c) => {
    if (newObj[c] !== obj[c]) {
      p = true;
    }
    return p;
  }, false);
};

class Settings extends Component {
  render() {
    const {
      wallet,
      walletsLoading,
      coin,
      coins,
      coinPick,
      coinsLoading,
    } = this.props;
    if (!wallet || walletsLoading || coinsLoading) {
      return null;
    }

    const {
      createdAt,
      lastModified,
      privateKey,
      publicAddress,
      alias,
      balanceURL,
      balanceProp,
      balanceUnit,
      transactionsURL,
      transactionsProp,
    } = wallet;
    const created = new Date(createdAt);
    const modified = new Date(lastModified);

    return (
      <details key={Date.now()}>
        <StickySummary>
          <H4>Settings</H4>
        </StickySummary>

        <Leaders>
          Created<Dots />
          {created.toDateString()}
        </Leaders>
        <Leaders>
          Last modified<Dots />
          {modified.toDateString()}
        </Leaders>

        <Form onSubmit={this.onSubmit}>
          <Leaders>
            Private Key (unencrypted)
            <Dots />
            <input
              placeholder="Private Key (unencrypted)"
              type="password"
              name="inputPrivateKey"
              required
              defaultValue={privateKey}
            />
          </Leaders>

          <Leaders>
            Public address
            <Dots />
            <input
              placeholder="Public Address"
              type="text"
              name="inputPublicAddress"
              required
              defaultValue={publicAddress}
            />
          </Leaders>

          <Leaders>
            Alias
            <Dots />
            <input
              placeholder="Alias"
              type="text"
              name="inputAlias"
              required
              defaultValue={alias}
            />
          </Leaders>

          <Leaders>
            Balance URL
            <Dots />
            <input
              placeholder="Balance URL"
              type="text"
              name="inputBalanceURL"
              defaultValue={balanceURL}
            />
          </Leaders>

          <Leaders>
            Balance property
            <Dots />
            <input
              placeholder="Balance Prop"
              type="text"
              name="inputBalanceProp"
              defaultValue={balanceProp}
            />
          </Leaders>

          <Leaders>
            Balance Unit
            <Dots />
            <input
              placeholder="Balance Unit"
              type="text"
              name="inputBalanceUnit"
              defaultValue={balanceUnit}
            />
          </Leaders>

          <Leaders>
            Transactions URL
            <Dots />
            <input
              placeholder="Transactions URL"
              type="text"
              name="inputTransactionsURL"
              defaultValue={transactionsURL}
            />
          </Leaders>

          <Leaders>
            Transactions property
            <Dots />
            <input
              placeholder="Transactions Prop"
              type="text"
              name="inputTransactionsProp"
              defaultValue={transactionsProp}
            />
          </Leaders>

          <Leaders>
            Coin
            <Dots />
            <CoinsView coin={coin} coins={coins} coinPick={coinPick} />
          </Leaders>

          <Centered>
            <Button type="submit">Update</Button>
          </Centered>
        </Form>

        <Centered>
          <Button onClick={this.onDelete}>Delete wallet</Button>
        </Centered>
      </details>
    );
  }

  onDelete = async id => {
    const msg =
      'You are about to delete a Wallet, this action cannot be undone. Are you sure?';
    if (window.confirm(msg)) {
      const { history, wallet: { id }, walletsDelete } = this.props;
      await walletsDelete(id);
      history.replace('/wallets');
    }
  };

  onSubmit = async form => {
    const { wallet: { id }, walletsPut } = this.props;
    const newValues = getWalletValues(form);
    if (didSomethingChange(newValues, this.props.wallet)) {
      await walletsPut(id, newValues);
    }
  };
}

export default Settings;
