import React, { Component, Fragment } from 'react';
import { getFile, putFile } from 'blockstack';
import uuid from 'uuid';
import { Header } from '../../components';

const CONTACTS_JSON = 'contacts.json'

const getContactValues = ({
  inputAlias,
  inputPublicAddress,
}) => {
  return {
    alias: inputAlias.value,
    publicAddress: inputPublicAddress.value,
  };
};

class Form extends Component {
  render() {
    const { btnLabel, onCancel, defaultValues = {} } = this.props;
    const {
      publicAddress = '',
      alias = '',
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
      </form>
    );
  }

  onSubmit = e => {
    e.preventDefault();
    this.props.onSubmit(this.form);
  };
}

export default class AddressBook extends Component {
  state = {
    list: [],
    listError: null,
    loading: true,
    editContact: null,
  };

  componentDidMount() {
    this.fetchContacts();
  }

  render() {
    const {
      list,
      listError,
      loading,
      editContact,
    } = this.state;
    const sortedList = list.sort((a, b) => b.lastModified - a.lastModified);
    return (
      <Fragment>
        <Header />
        <div>
          {listError && (
            <div>There was an error fetching the contacts: {listError}</div>
          )}
          {editContact ? (
            <Form
              defaultValues={{ ...list.find(({ id }) => id === editContact) }}
              onCancel={this.onCancelEdit}
              onSubmit={this.onEdit}
              btnLabel={'Save'}
            />
          ) : (
            <Form
              onSubmit={this.onNew}
              btnLabel={'Add new'}
            />
          )}
          {loading ? (
            <div>loading</div>
          ) : (
            <ul>
              {sortedList.map(
                ({ id, createdAt, lastModified, alias }, index) => {
                  const created = new Date(createdAt);
                  const modified = new Date(lastModified);
                  return (
                    <li key={`contacts-${id}`}>
                      <button onClick={() => this.setState({ editContact: id })}>
                        Edit
                      </button>
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

  fetchContacts = async () => {
    this.setState({ loading: true });

    try {
      const file = await getFile(CONTACTS_JSON);
      const list = JSON.parse(file || '[]');
      this.setState({ list, loading: false });
    } catch (e) {
      this.setState({ listError: e.toString() });
    }
  };

  onCancelEdit = e => {
    e.preventDefault()
    this.setState({ editContact: null })
  }

  onDelete = async id => {
    this.setState({ loading: true });

    const newList = this.state.list.filter(item => item.id !== id);
    await putFile(CONTACTS_JSON, JSON.stringify(newList));
    this.fetchContacts();
  };

  onEdit = async form => {
    this.setState({ loading: true });

    const { list, editContact } = this.state;
    const current = list.find(({ id }) => id === editContact);
    const { id, createdAt, lastModified, ...values } = getContactValues(form);
    const newList = [
      ...list.filter(({ id }) => id !== editContact),
      { ...current, ...values, lastModified: Date.now() },
    ];
    await putFile(CONTACTS_JSON, JSON.stringify(newList));
    form.reset();
    this.fetchContacts();
  };

  onNew = async form => {
    this.setState({ loading: true });

    const values = getContactValues(form);
    const newList = [
      ...this.state.list,
      {
        id: uuid(),
        createdAt: Date.now(),
        lastModified: Date.now(),
        ...values,
      },
    ];
    await putFile(CONTACTS_JSON, JSON.stringify(newList));
    form.reset();
    this.fetchContacts();
  };
}
