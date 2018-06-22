import React, { Component } from 'react';
import styled from 'styled-components';
import { Leaders, Dots, Button } from '../theme';
import { Form, Assets } from './';
import isMobile from '../utils/isMobile';

const Buttons = styled.div`
  display: grid;
  grid-template-columns: 150px 150px;
  grid-gap: 2em;
  justify-content: center;
  margin: 2em auto;
`;

const H4 = styled.h4`
  display: inline-block;
`;

const DeleteButton = Button.extend`
  border-color: #b31313;
  color: #b31313;
`;

const getWalletValues = ({
  inputPrivateKey,
  inputAlias,
  selectAssets,
  ...rest
}) => {
  return {
    privateKey: inputPrivateKey.value,
    alias: inputAlias.value,
    assets: isMobile
      ? Array.from(selectAssets.selectedOptions, ({ value }) => value)
      : selectAssets.value.split(','),
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
      <details>
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
            />
          </Leaders>

          <Buttons>
            <DeleteButton type="button" onClick={this.onDelete}>
              Delete wallet
            </DeleteButton>
            <Button type="submit">Update</Button>
          </Buttons>
        </Form>
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
      form.reset();
      await walletsPut(id, newValues);
    }
  };
}

export default Settings;
