import React, { Component, Fragment, Children, cloneElement } from 'react';
import uuid from 'uuid';
import { getFile, putFile } from 'blockstack';
import Compose from '../Compose';
import AddressBookView from './Book';
import AddressView from './Address';

const ADDRESS_BOOK_JSON = 'address-book.json';

const sort = (a, b) => a.alias.localeCompare(b.alias);

const View = ({ address, ...rest }) => {
  if (address) {
    return <AddressView {...{ address, ...rest }} />;
  }

  return <AddressBookView {...rest} />;
};

class Store extends Component {
  state = {
    error: null,
    loading: false,
    addressBook: [],
    address: null,
  };

  render() {
    const { address, addressBook, loading, error } = this.state;
    const { children, ...rest } = this.props;
    return (
      <Fragment>
        {Children.map(this.props.children, child =>
          cloneElement(child, {
            ...rest,
            address,
            addressBook,
            addressBookError: error && (
              <div>There was an error fetching the address book: {error}</div>
            ),
            addressBookLoading: loading,
            addressBookGet: this.get,
            addressBookDelete: this.delete,
            addressBookPut: this.put,
            addressBookPost: this.post,
            addressPick: this.pick,
            addressRelease: this.release,
          }),
        )}
      </Fragment>
    );
  }

  delete = async addressId => {
    this.setState({ loading: true });

    const newList = this.state.addressBook.filter(({ id }) => id !== addressId);
    await putFile(ADDRESS_BOOK_JSON, JSON.stringify(newList));
  };

  get = async () => {
    this.setState({ loading: true });

    try {
      const file = await getFile(ADDRESS_BOOK_JSON);
      const rawAddressBook = JSON.parse(file || '[]');
      const addressBook = rawAddressBook.sort(sort);
      this.setState({ addressBook, loading: false });
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };

  pick = addressId => {
    const address = this.state.addressBook.find(({ id }) => addressId === id);
    if (!address) {
      return;
    }
    this.setState({ address });
  };

  post = async ({ symbol, ...rest }) => {
    const obj = { ...rest, symbol: symbol.toLowerCase() };
    this.setState({ loading: true });

    const newObj = {
      ...obj,
      id: uuid(),
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
    const newList = [...this.state.addressBook, newObj];
    await putFile(ADDRESS_BOOK_JSON, JSON.stringify(newList));
    return newObj;
  };

  put = async (addressId, { symbol, ...rest }) => {
    const obj = { ...rest, symbol: symbol.toLowerCase() };
    this.setState({ loading: true });

    const { addressBook } = this.state;
    const { id, createdAt, lastModified, ...current } = addressBook.find(
      ({ id }) => id === addressId,
    );
    const newList = [
      ...addressBook.filter(w => w.id !== id),
      { ...current, ...obj, id, createdAt, lastModified: Date.now() },
    ];
    await putFile(ADDRESS_BOOK_JSON, JSON.stringify(newList));
  };

  release = () => {
    this.setState({ address: null });
  };
}

class Saga extends Component {
  componentDidMount() {
    this.props.addressBookGet();
  }

  render() {
    const {
      children,
      addressBookDelete,
      addressBookPut,
      addressBookPost,
      ...rest
    } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            addressBookDelete: this.delete,
            addressBookPut: this.put,
            addressBookPost: this.post,
          }),
        )}
      </Fragment>
    );
  }

  delete = async addressId => {
    const {
      address,
      addressRelease,
      addressBookDelete,
      addressBookGet,
    } = this.props;
    if (address && address.id === addressId) {
      addressRelease();
    }
    await addressBookDelete(addressId);
    await addressBookGet();
  };

  put = async (addressId, data) => {
    const { addressRelease, addressBookPut, addressBookGet } = this.props;
    addressRelease();
    await addressBookPut(addressId, data);
    await addressBookGet();
  };

  post = async data => {
    const { addressBookPost, addressBookGet, addressPick } = this.props;
    const newAddress = await addressBookPost(data);
    await addressBookGet();
    addressPick(newAddress.id);
  };
}

const SagaStore = Compose(Store, Saga);

export { SagaStore as Store, View };
export default Compose(SagaStore, View);
