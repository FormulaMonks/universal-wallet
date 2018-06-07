import React, { Component, Fragment } from 'react';
import { NavHeader, ContactsStore, CoinsStore } from '../components';

const getFormValues = ({ inputAlias, inputPublicAddress, inputSymbol }) => {
  return {
    alias: inputAlias.value,
    publicAddress: inputPublicAddress.value,
    symbol: inputSymbol.value,
  };
};

class Form extends Component {
  render() {
    const { coins, btnLabel, onCancel, defaultValues = {} } = this.props;
    const { publicAddress = '', alias = '', symbol = '' } = defaultValues;
    return (
      <form
        ref={f => (this.form = f)}
        onSubmit={this.onSubmit}
        key={Date.now()}
      >
        <input type="submit" value={btnLabel} />
        {onCancel && <button onClick={onCancel}>Cancel</button>}
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

class Contacts extends Component {
  render() {
    const {
      contact,
      contacts,
      contactsError,
      contactsLoading,
      contactPick,
      coins,
      coinsError,
      coinsLoading,
    } = this.props;
    const sortedList = contacts.sort((a, b) => b.lastModified - a.lastModified);

    return (
      <Fragment>
        <div>
          {contactsError}
          {coinsError}
          {contact ? (
            <Form
              coins={coins}
              defaultValues={{ ...contact }}
              onCancel={this.onEditCancel}
              onSubmit={this.onEdit}
              btnLabel={'Save'}
            />
          ) : (
            <Form
              onSubmit={this.onNew}
              btnLabel={'Add new'}
              coins={coins}
            />
          )}
          {contactsLoading || coinsLoading ? (
            <div>loading</div>
          ) : (
            <ul>
              {sortedList.map(
                ({ id, createdAt, lastModified, alias, symbol }, index) => {
                  const { name, imageSmall } = coins.find(
                    item => item.symbol === symbol,
                  );
                  const created = new Date(createdAt);
                  const modified = new Date(lastModified);
                  return (
                    <li key={`contacts-${id}`}>
                      <button onClick={() => contactPick(id)}>
                        Edit
                      </button>
                      <img alt={`${name}`} src={imageSmall} />
                      <div>{alias}</div>
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

  onDelete = async id => {
    await this.props.contactsDelete(id);
  };

  onEdit = async form => {
    await this.props.contactsPut(this.props.contact.id, getFormValues(form));
    form.reset();
  };

  onEditCancel = e => {
    e.preventDefault();
    this.props.contactRelease()
  };

  onNew = async form => {
    await this.props.contactsPost(getFormValues(form));
    form.reset();
  };
}

export default () => (
  <Fragment>
    <NavHeader />
    <CoinsStore>
      <ContactsStore>
        <Contacts />
      </ContactsStore>
    </CoinsStore>
  </Fragment>
);
