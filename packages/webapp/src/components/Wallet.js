import React, { Component, Fragment, Children, cloneElement } from 'react';
import qr from 'qr-encode';
import { Balance, BalanceStore, Currency, Spinner } from './';
import Compose from './Compose';
import { H3Wallet, DivQrPublicAddress, Leaders, Dots } from '../theme';

const View = ({ wallet, walletsLoading, coins, coinsLoading }) => {
  if (!wallet || walletsLoading || coinsLoading) {
    return <Spinner />;
  }
  const { publicAddress, alias, symbol } = wallet;
  const { imageSmall } = coins.find(
    c => c.symbol.toLowerCase() === symbol.toLowerCase(),
  );

  return (
    <Fragment>
      <H3Wallet>
        {imageSmall && <img src={imageSmall} alt={symbol} />}
        {alias}
      </H3Wallet>

      <DivQrPublicAddress>
        <img src={qr(publicAddress)} alt={publicAddress} />
        <div>{publicAddress}</div>
      </DivQrPublicAddress>

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
    const {
      match: { params: { id } },
      wallet,
      wallets,
      walletsLoading,
      coin,
      coins,
      coinsLoading,
    } = this.props;
    if (
      id !== prevProps.match.params.id ||
      walletsLoading !== prevProps.walletsLoading ||
      wallets.length !== prevProps.wallets.length ||
      (wallet && !prevProps.wallet) ||
      coinsLoading !== prevProps.coinsLoading ||
      coins.length !== prevProps.coins.length ||
      (coin && !prevProps.coin)
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
      coin,
      coinPick,
      coinsLoading,
      match: { params: { id } },
    } = this.props;

    if (walletsLoading || coinsLoading) {
      return;
    }
    if (!id || !wallets.find(w => w.id === id)) {
      this.props.history.push('/404');
      return;
    }
    if (!wallet) {
      walletPick(id);
      return;
    }
    if (!coin) {
      coinPick(wallet.symbol);
      return;
    }

    this.setState({ loading: false });
  };
}

export { View };
export default Compose(Saga, View);
