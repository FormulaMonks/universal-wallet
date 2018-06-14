import React, { Component, Fragment, Children, cloneElement } from 'react';
import qr from 'qr-encode';
import { Balance, BalanceStore, Currency, Spinner, ImgFromSymbol } from './';
import Compose from './Compose';
import { H3Wallet, DivQrPublicAddress, Leaders, Dots } from '../theme';

const ExtraBalance = ({ balance }) => {
  if (!Array.isArray(balance)) {
    return null;
  }

  return (
    <Leaders>
      <div>Ether</div>
      <Dots />
      <div>ETH {balance[1]}</div>
    </Leaders>
  );
};

const View = ({
  wallet,
  walletsLoading,
  coins,
  coinsLoading,
  tokens,
  tokensLoading,
}) => {
  if (!wallet || walletsLoading || coinsLoading || tokensLoading) {
    return <Spinner />;
  }
  const { publicAddress, alias, symbol } = wallet;
  const token = tokens.find(t => t.symbol === symbol);

  return (
    <Fragment>
      <H3Wallet>
        <ImgFromSymbol
          symbol={symbol}
          coins={coins}
          tokens={tokens}
          coinsLoading={coinsLoading}
          tokensLoading={tokensLoading}
        />
        {alias} ({symbol.toUpperCase()})
      </H3Wallet>

      <DivQrPublicAddress>
        <img src={qr(publicAddress)} alt={publicAddress} />
        <div>{publicAddress}</div>
      </DivQrPublicAddress>

      <Leaders>
        <div>Balance</div>
        <Dots />
        <div>
          <Balance wallet={wallet} token={token} />
        </div>
      </Leaders>

      <BalanceStore wallet={wallet} token={token}>
        <ExtraBalance />
      </BalanceStore>

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
      token,
      tokens,
      tokensLoading,
    } = this.props;
    if (
      id !== prevProps.match.params.id ||
      walletsLoading !== prevProps.walletsLoading ||
      wallets.length !== prevProps.wallets.length ||
      (wallet && !prevProps.wallet) ||
      coinsLoading !== prevProps.coinsLoading ||
      coins.length !== prevProps.coins.length ||
      (coin && !prevProps.coin) ||
      tokensLoading !== prevProps.tokensLoading ||
      tokens.length !== prevProps.tokens.length ||
      (token && !prevProps.token)
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
      token,
      tokenPick,
      tokens,
      tokensLoading,
      match: { params: { id } },
    } = this.props;

    if (walletsLoading || coinsLoading || tokensLoading) {
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

    const { symbol } = wallet;
    if (!coin && !token) {
      const token = tokens.find(t => t.symbol === symbol);
      if (token) {
        tokenPick(token.id);
        return;
      }
      coinPick(symbol);
      return;
    }

    this.setState({ loading: false });
  };
}

export { View };
export default Compose(Saga, View);
