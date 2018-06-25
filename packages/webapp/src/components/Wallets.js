import React, { Component, Fragment, Children, cloneElement } from 'react';
import { Link } from 'react-router-dom';
import uuid from 'uuid';
import { getFile, putFile } from 'blockstack';
import styled from 'styled-components';
import { Balances, BalancesInUSD, Spinner } from './';
import {
  SectionHeader,
  SectionTitle,
  UlGrid,
  LiGrid,
  Leaders,
  Dots,
  Center,
} from '../theme';
import Compose from './Compose';

const WALLETS_JSON = 'wallets_1.json';

const sort = (a, b) => a.alias.localeCompare(b.alias);

const LiGridWallet = LiGrid.extend`
  svg {
    font-size: 20px;
    color: #999;
  }
`;

const DivAdd = styled.div`
  text-align: center;

  & a {
    display: inline-block;
    text-decoration: none;
    color: initial;
    font-family: 'Open Sans', sans-serif;
    padding: 0.5em 2em;
    border: 1px solid #ccc;
    background: #fff;
    font-size: 14px;
    cursor: pointer;

    &:enabled:hover {
      border-color: rgba(0, 0, 0, 0);
      color: #fff;
      background: rgba(37, 58, 84, 0.7);
    }

    &:enabled:active {
      border-color: rgba(0, 0, 0, 0);
      color: #fff;
      background: rgba(37, 58, 84, 0.9);
    }
  }
`;

const DivAddEmpty = DivAdd.extend`
  margin-top: 2em;
`;

const DivLeaders = Leaders.extend`
  margin-right: 1em;
`;

const View = ({
  balances,
  wallets,
  walletsLoading,
  walletPick,
  coins,
  coinsLoading,
  token,
  tokens,
  tokensLoading,
  ...rest
}) => {
  return (
    <Fragment>

      <SectionHeader>
        <SectionTitle>My wallets</SectionTitle>
        {!!wallets.length && (
          <DivAdd>
            <Link to="new-wallet">Add wallet</Link>
          </DivAdd>
        )}
      </SectionHeader>

      {walletsLoading || coinsLoading || tokensLoading  ? (
        <Spinner />
      ) : (
        <Fragment>

          {!wallets.length ? (
            <Center>
              <div>You have not added any wallets</div>
              <DivAddEmpty>
                <Link to="new-wallet">Add wallet</Link>
              </DivAddEmpty>
            </Center>
          ) : (
            <UlGrid>
              {wallets.map(wallet => {
                const { id, alias } = wallet;

                return (
                  <LiGridWallet key={`wallets-${id}`}>
                    <Link to={`/wallets/${id}`}>
                      <i className="fas fa-wallet" />

                      <div>
                        <div>{alias}</div>

                        <DivLeaders>
                          <div>USD (all assets)</div>
                          <Dots />
                          <Balances coins={coins} tokens={tokens} wallet={wallet}>
                            <BalancesInUSD />
                          </Balances>
                        </DivLeaders>
                      </div>
                    </Link>
                  </LiGridWallet>
                );
              })}

            </UlGrid>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

class Store extends Component {
  state = {
    error: null,
    loading: false,
    wallets: null,
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

  put = async (walletId, { assets, ...rest }) => {
    const obj = { ...rest, assets: assets.map(a => a.toLowerCase()) };
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
  state = { loading: true };

  componentDidMount() {
    this.props.walletsGet();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.walletsLoading !== this.props.walletsLoading) {
      this.setState({ loading: this.props.walletsLoading });
    }
  }

  render() {
    const { children, wallets, walletsPut, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            wallets: wallets || [],
            walletsLoading: this.state.loading,
            walletsPut: this.put,
          }),
        )}
      </Fragment>
    );
  }

  put = async (walletId, data) => {
    const { walletsPut, walletPick, walletsGet, walletRelease } = this.props;
    await walletsPut(walletId, data);
    walletRelease()
    await walletsGet();
    walletPick(walletId);
  };
}

const StoreSaga = Compose(Store, Saga);

export { sort, StoreSaga as Store, View };
export default Compose(StoreSaga, View);
