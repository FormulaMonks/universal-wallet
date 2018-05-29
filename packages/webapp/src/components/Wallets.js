import React, { Component, Fragment, Children, cloneElement } from 'react';
import uuid from 'uuid';
import { getFile, putFile } from 'blockstack';
import { WALLETS_JSON } from '../utils/constants';
import composeStore from '../utils/composeStore';

export const sort = (a, b) => a.alias.localeCompare(b.alias);

export const View = ({ wallets, walletsError, walletsLoading, walletPick }) => (
  <Fragment>
    {walletsError}
    {walletsLoading ? (
      <div>loading</div>
    ) : (
      <select defaultValue="" onChange={e => walletPick(e.currentTarget.value)}>
        <option disabled value="" hidden>
          Wallet
        </option>
        {wallets.map(({ id, alias }) => (
          <option key={`wallets-${id}`} value={id}>
            {alias}
          </option>
        ))}
      </select>
    )}
  </Fragment>
);

class Store extends Component {
  state = {
    error: null,
    loading: false,
    wallets: [],
    wallet: null,
  };

  render() {
    const { wallets, loading, error } = this.state;
    const { children, ...rest } = this.props;
    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            wallets,
            walletsError: error && (
              <div>There was an error fetching the wallets: {error}</div>
            ),
            walletsLoading: loading,
            walletsGet: this.get,
            walletsDelete: this.delete,
            walletsPut: this.put,
            walletsPost: this.post,
            wallet: this.state.wallet,
            walletPick: this.pick,
            walletRelease: this.release,
          }),
        )}
      </Fragment>
    );
  }

  delete = async walletId => {
    this.setState({ loading: true });

    const newList = this.state.wallets.filter(({ id }) => id !== walletId);
    await putFile(WALLETS_JSON, JSON.stringify(newList));
  };

  get = async () => {
    this.setState({ loading: true });

    try {
      const file = await getFile(WALLETS_JSON);
      const rawWallets = JSON.parse(file || '[]');
      const wallets = rawWallets.sort(sort);
      this.setState({ wallets, loading: false });
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
    const newList = [...this.state.wallets, newObj];
    await putFile(WALLETS_JSON, JSON.stringify(newList));
    return newObj;
  };

  put = async (walletId, obj) => {
    this.setState({ loading: true });

    const { wallets } = this.state;
    const { id, createdAt, lastModified, ...current } = wallets.find(
      ({ id }) => id === walletId,
    );
    const newList = [
      ...wallets.filter(w => w.id !== id),
      { ...current, ...obj, id, createdAt, lastModified: Date.now() },
    ];
    await putFile(WALLETS_JSON, JSON.stringify(newList));
  };

  pick = walletId => {
    const wallet = this.state.wallets.find(({ id }) => walletId === id);
    if (!wallet) {
      return;
    }
    this.setState({ wallet });
  };

  release = () => {
    this.setState({ wallet: null });
  };
}

class Saga extends Component {
  componentDidMount() {
    this.props.walletsGet();
  }

  render() {
    const {
      children,
      walletsDelete,
      walletsPost,
      walletsPut,
      ...rest
    } = this.props;
    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            walletsDelete: this.delete,
            walletsPut: this.put,
            walletsPost: this.post,
          }),
        )}
      </Fragment>
    );
  }

  delete = async walletId => {
    const { wallet, walletsGet, walletRelease, walletsDelete } = this.props;
    if (wallet && wallet.id === walletId) {
      walletRelease();
    }
    await walletsDelete(walletId);
    await walletsGet();
  };

  put = async (walletId, data) => {
    const { walletRelease, walletsPut, walletPick, walletsGet } = this.props;
    walletRelease();
    await walletsPut(walletId, data);
    await walletsGet();
    walletPick(walletId);
  };

  post = async data => {
    const { walletsPost, walletsGet, walletPick } = this.props;
    const newWallet = await walletsPost(data);
    await walletsGet();
    walletPick(newWallet.id);
  };
}

const store = composeStore(Store, Saga);

export { store as Store };
