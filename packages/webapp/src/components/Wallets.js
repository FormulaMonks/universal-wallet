import React, { Component, Fragment, Children, cloneElement } from 'react';
import { Link } from 'react-router-dom';
import uuid from 'uuid';
import { getFile, putFile } from 'blockstack';
import styled from 'styled-components';
import { Spinner, Balance, BalanceStore, Currency } from '../components';
import { SectionTitle, Ul, Leaders, Dots, Button } from '../theme';
import Compose from './Compose';

const WALLETS_JSON = 'wallets.json';

const sort = (a, b) => a.alias.localeCompare(b.alias);

const DivAdd = styled.div`
  text-align: center;
  margin-top: 2em;
`;

const Msg = styled.div`
  text-align: center;
`;

const UlWallets = Ul.extend`
  display: grid;
  grid-gap: 1em;

  @media (min-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));
  }
`;

const DivLeaders = Leaders.extend`
  margin-right: 1em;
`;

const Li = styled.li`
  padding: 0.5em;

  &:nth-child(odd) {
    background: rgba(200, 200, 200, 0.1);
  }

  & a {
    color: initial;
    text-decoration: none;
    display: block;
    border: none;
    cursor: pointer;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 0.5em;
  }

  @media (min-width: 600px) {
    background: rgba(200, 200, 200, 0.1);
  }
`;

const ImgSymbol = ({ symbol, coins, coinsLoading }) => {
  if (coinsLoading) {
    return null;
  }

  const { imageSmall } = coins.find(c => c.symbol === symbol);
  if (!imageSmall) {
    return null;
  }

  return <img src={imageSmall} alt={symbol} />;
};

const View = ({
  wallets,
  walletsError,
  walletsLoading,
  walletPick,
  coins,
  coinsLoading,
  ...rest
}) => (
  <Fragment>
    {walletsError}
    <SectionTitle>My wallets</SectionTitle>
    {walletsLoading ? (
      <Spinner />
    ) : (
      <Fragment>
        {!wallets.length ? (
          <Fragment>
            <Msg>You have not added any wallets yet.</Msg>
            <DivAdd>
              <Button onClick={() => rest.history.push('/wallets')}>
                Add wallet
              </Button>
            </DivAdd>
          </Fragment>
        ) : (
          <UlWallets>
            {wallets.map(wallet => {
              const { id, alias, symbol } = wallet;

              return (
                <Li key={`wallets-${id}`}>
                  <Link to={`/${id}`}>
                    <ImgSymbol
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
                          <Balance wallet={wallet} />
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
                </Li>
              );
            })}
          </UlWallets>
        )}
      </Fragment>
    )}
  </Fragment>
);

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
    const {
      children,
      wallets,
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
            wallets: wallets || [],
            walletsLoading: this.state.loading,
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

const StoreSaga = Compose(Store, Saga);

export { sort };
export { StoreSaga as Store };
export { View };
export default Compose(StoreSaga, View);
