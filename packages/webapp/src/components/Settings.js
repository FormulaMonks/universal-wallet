import React, { Component } from 'react';
import styled from 'styled-components';
import { Center, Leaders, Dots, Button } from '../theme';
import { Form, Assets } from './';

const Centered = Center.extend`
  margin: 2em auto;
`;

const H4 = styled.h4`
  display: inline-block;
`;

const getWalletValues = ({ inputPrivateKey, inputAlias, selectAssets }) => {
  return {
    privateKey: inputPrivateKey.value,
    alias: inputAlias.value,
    assets: Array.from(selectAssets.selectedOptions, ({ value }) => value),
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
      coins,
      coinsLoading,
      tokens,
      tokensLoading,
    } = this.props;
    if (!wallet || walletsLoading || coinsLoading || tokensLoading) {
      return null;
    }

    const { createdAt, lastModified, privateKey, alias, assets } = wallet;
    const created = new Date(createdAt);
    const modified = new Date(lastModified);

    return (
      <details key={Date.now()}>
        <summary>
          <H4>Settings</H4>
        </summary>

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
            Private Key (unencrypted)
            <Dots />
            <input
              placeholder="Private Key (unencrypted)"
              type="password"
              autoComplete="off"
              name="inputPrivateKey"
              required
              defaultValue={privateKey}
            />
          </Leaders>

          <Leaders>
            Assets
            <Dots />
            <Assets
              multiple={true}
              tokens={tokens}
              coins={coins}
              assets={assets}
              required={true}
              onChange={this.onPick}
            />
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
