import React, { Component, Fragment, Children, cloneElement } from 'react';
import uuid from 'uuid';
import { getFile, putFile } from 'blockstack';
import { CONTACTS_JSON } from '../utils/constants';
import composeStore from '../utils/composeStore';

export const sort = (a, b) => a.alias.localeCompare(b.alias);

class Store extends Component {
  state = {
    error: null,
    loading: true,
    contacts: [],
    contact: null,
  };

  render() {
    const { contact, contacts, loading, error } = this.state;
    const { children, ...rest } = this.props;
    return (
      <Fragment>
        {Children.map(this.props.children, child =>
          cloneElement(child, {
            ...rest,
            contact,
            contacts,
            contactsError: error && (
              <div>There was an error fetching the contacts: {error}</div>
            ),
            contactsLoading: loading,
            contactsGet: this.get,
            contactsDelete: this.delete,
            contactsPut: this.put,
            contactsPost: this.post,
            contactPick: this.pick,
            contactRelease: this.release,
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
      const rawContacts = JSON.parse(file || '[]');
      const contacts = rawContacts.sort(sort);
      this.setState({ contacts, loading: false });
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };

  pick = contactId => {
    const contact = this.state.contacts.find(({ id }) => contactId === id);
    if (!contact) {
      return;
    }
    this.setState({ contact });
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
    return newObj;
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

  release = () => {
    this.setState({ contact: null });
  };
}

class Saga extends Component {
  componentDidMount() {
    this.props.contactsGet();
  }

  render() {
    const {
      children,
      contactsDelete,
      contactsPut,
      contactsPost,
      ...rest
    } = this.props;
    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            contactsDelete: this.delete,
            contactsPut: this.put,
            contactsPost: this.post,
          }),
        )}
      </Fragment>
    );
  }

  delete = async contactId => {
    const { contact, contactRelease, contactsDelete, contactsGet } = this.props;
    if (contact && contact.id === contactId) {
      contactRelease();
    }
    await contactsDelete(contactId);
    await contactsGet();
  };

  put = async (contactId, data) => {
    const {
      contactRelease,
      contactsPut,
      contactPick,
      contactsGet,
    } = this.props;
    contactRelease();
    await contactsPut(contactId, data);
    await contactsGet();
    contactPick(contactId);
  };

  post = async data => {
    const { contactsPost, contactsGet, contactPick } = this.props;
    const newContact = await contactsPost(data);
    await contactsGet();
    contactPick(newContact.id);
  };
}

const store = composeStore(Store, Saga);

export { store as Store };
