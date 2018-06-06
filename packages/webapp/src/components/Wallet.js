import React, { Component, Fragment, Children, cloneElement } from 'react';
import qr from 'qr-encode';
import { Balance, BalanceStore, Currency } from './';
import Compose from './Compose';
import { Center, Leaders, Dots } from '../theme';
import styled from 'styled-components';
import { SHAPESHIFT } from '../utils/ss';

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

  & img{
    margin-right: 0.5em;
  }
`;

const DivPublicAddress = styled.div`
  margin-top: 1em;
  font-size: 12px;
  word-break: break-all;
`;

const View = ({ wallet, walletLoading, coins }) => {
  if (!wallet || !wallet.publicAddress) {
    return null;
  }
  const { publicAddress, alias, symbol } = wallet;
  const { imageSmall } = ({} = coins.find(c => c.symbol === symbol));

  return (
    <Fragment>
      <H3>
        {imageSmall && <img src={`${SHAPESHIFT}${imageSmall}`} alt={symbol} />}
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
  componentDidMount() {
    this.check();
  }

  componentDidUpdate() {
    this.check();
  }

  render() {
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
      wallet,
      walletPick,
      match: { params: { id } },
    } = this.props;
    if (!wallet && id && wallets.find(w => w.id === id)) {
      walletPick(id);
    }
  };
}

export { View };
export default Compose(Saga, View);
