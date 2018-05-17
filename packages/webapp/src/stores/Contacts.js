import React, { Component, Fragment, Children, cloneElement } from 'react';
import uuid from 'uuid';
import { getFile, putFile } from 'blockstack';
import { CONTACTS_JSON } from '../utils/constants';

export default class contacts extends Component {
  state = {
    error: null,
    loading: true,
    contacts: [],
  };

  componentDidMount() {
    this.get();
  }

  render() {
    const { contacts, loading, error } = this.state;
    const { children, ...rest } = this.props;
    return (
      <Fragment>
        {Children.map(this.props.children, child =>
          cloneElement(child, {
            contacts,
            contactsError: error && (
              <div>There was an error fetching the contacts: {error}</div>
            ),
            contactsLoading: loading,
            contactsGet: this.get,
            contactsDelete: this.delete,
            contactsPut: this.put,
            contactsPost: this.post,
            ...rest,
          }),
        )}
      </Fragment>
    );
  }

  delete = async contactId => {
    this.setState({ loading: true });

    const newList = this.state.contacts.filter(({ id }) => id !== contactId);
    await putFile(CONTACTS_JSON, JSON.stringify(newList));
  };

  get = async () => {
    this.setState({ loading: true });

    try {
      const file = await getFile(CONTACTS_JSON);
      const contacts = JSON.parse(file || '[]');
      this.setState({ contacts, loading: false });
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };

  post = async obj => {
    this.setState({ loading: true });

    const newObj = {
      ...obj,
      id: uuid(),
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
    const newList = [...this.state.contacts, newObj];
    await putFile(CONTACTS_JSON, JSON.stringify(newList));
  };

  put = async (contactId, obj) => {
    this.setState({ loading: true });

    const { contacts } = this.state;
    const { id, createdAt, lastModified, ...current } = contacts.find(
      ({ id }) => id === contactId,
    );
    const newList = [
      ...contacts.filter(w => w.id !== id),
      { ...current, ...obj, id, createdAt, lastModified: Date.now() },
    ];
    await putFile(CONTACTS_JSON, JSON.stringify(newList));
  };
}
