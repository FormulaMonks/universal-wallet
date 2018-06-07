import React, { Component, Fragment, Children, cloneElement } from 'react';
import qr from 'qr-encode';
import { Balance, BalanceStore, Currency } from './';
import Compose from './Compose';
import { Center, Leaders, Dots } from '../theme';
import styled from 'styled-components';

const Centered = Center.extend`
  background: rgba(200, 200, 200, 0.1);
  padding: 1em;
  padding-top: 1.5em;
`;

const H3 = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  & img {
    margin-right: 0.5em;
  }
`;

const DivPublicAddress = styled.div`
  margin-top: 1em;
  font-size: 12px;
  word-break: break-all;
`;

const View = ({ wallet, walletLoading, coins, coinsLoading }) => {
  if (!wallet || !wallet.publicAddress || coinsLoading) {
    return null;
  }
  const { publicAddress, alias, symbol } = wallet;
  const { imageSmall } = coins.find(c => c.symbol === symbol);

  return (
    <Fragment>
      <H3>
        {imageSmall && <img src={imageSmall} alt={symbol} />}
        {alias}
      </H3>

      <Centered>
        <img src={qr(publicAddress)} alt={publicAddress} />
        <DivPublicAddress>{publicAddress}</DivPublicAddress>
      </Centered>

      <Leaders>
        <div>Balance</div>
        <Dots />
        <div>
          <Balance wallet={wallet} />
        </div>
      </Leaders>

      <Leaders>
        <div>USD</div>
        <Dots />
        <BalanceStore wallet={wallet}>
          <Currency />
        </BalanceStore>
      </Leaders>
    </Fragment>
  );
};

class Saga extends Component {
  state = { loading: true };

  componentDidMount() {
    this.check();
  }

  componentDidUpdate(prevProps) {
    const { match: { params: { id } }, wallets, walletsLoading } = this.props;
    if (
      id !== prevProps.match.params.id ||
      walletsLoading !== prevProps.walletsLoading ||
      wallets.length !== prevProps.wallets.length
    ) {
      this.check();
    }
  }

  render() {
    if (this.state.loading) {
      return null;
    }
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child => cloneElement(child, { ...rest }))}
      </Fragment>
    );
  }

  check = () => {
    const {
      wallets,
      walletsLoading,
      wallet,
      walletPick,
      match: { params: { id } },
    } = this.props;

    if (walletsLoading) {
      return;
    }
    if (!id || !wallets.find(w => w.id === id)) {
      this.props.history.push('/404');
      return;
    }
    if (!wallet) {
      walletPick(id);
    }
    this.setState({ loading: false });
  };
}

export { View };
export default Compose(Saga, View);
