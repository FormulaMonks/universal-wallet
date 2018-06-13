import React, { Component, Fragment, Children, cloneElement } from 'react';
import { Link } from 'react-router-dom';
import uuid from 'uuid';
import { getFile, putFile } from 'blockstack';
import styled from 'styled-components';
import {
  Spinner,
  Balance,
  BalanceStore,
  Currency,
  ImgFromSymbol,
} from '../components';
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

const WALLETS_JSON = 'wallets.json';

const sort = (a, b) => a.alias.localeCompare(b.alias);

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
  wallets,
  walletsLoading,
  walletPick,
  coins,
  coinsLoading,
  tokens,
  tokensLoading,
  ...rest
}) => {

  return <Fragment>
    <SectionHeader>
      <SectionTitle>My wallets</SectionTitle>
      {!!wallets.length && (
        <DivAdd>
          <Link to="new-wallet">Add wallet</Link>
        </DivAdd>
      )}
    </SectionHeader>
    {walletsLoading || coinsLoading || tokensLoading ? (
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
              const { id, alias, symbol } = wallet;
              const token = tokens.find(t => t.symbol === symbol)

              return (
                <LiGrid key={`wallets-${id}`}>
                  <Link to={`/wallets/${id}`}>
                    <ImgFromSymbol
                      symbol={symbol}
                      coins={coins}
                      coinsLoading={coinsLoading}
                    />

                    <div>
                      <div>{alias}</div>
                      <DivLeaders>
                        <div>Balance</div>
                        <Dots />
                        <div>
                          <Balance wallet={wallet} token={token} />
                        </div>
                      </DivLeaders>

                      <DivLeaders>
                        <div>USD</div>
                        <Dots />
                        <BalanceStore wallet={wallet}>
                          <Currency />
                        </BalanceStore>
                      </DivLeaders>
                    </div>
                  </Link>
                </LiGrid>
              );
            })}
          </UlGrid>
        )}
      </Fragment>
    )}
  </Fragment>
}

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

  post = async ({ symbol, ...rest }) => {
    const obj = { ...rest, symbol: symbol.toLowerCase() };
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

  put = async (walletId, { symbol, ...rest }) => {
    const obj = { ...rest, symbol: symbol.toLowerCase() };
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
    const { walletsPut, walletPick, walletsGet } = this.props;
    await walletsPut(walletId, data);
    await walletsGet();
    walletPick(walletId);
  };
}

const StoreSaga = Compose(Store, Saga);

export { sort };
export { StoreSaga as Store };
export { View };
export default Compose(StoreSaga, View);
