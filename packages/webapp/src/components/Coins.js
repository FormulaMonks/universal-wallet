import React, { Component, Fragment, Children, cloneElement } from 'react';
import { SHAPESHIFT_GETCOINS } from '../utils/ss';
import Compose from '../components/Compose';
import styled from 'styled-components';

const DivSelect = styled.div`
  position: relative;
`;

const DivI = styled.div`
  font-size: 20px;
  color: #444;
  display: ${({ symbol }) => (symbol === '' ? 'block' : 'none')};
`;

const Select = styled.select`
  position: absolute;
  width: 25px;
  height: 25px;
  right: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
`;

const Image = ({ imageSmall, symbol }) => (
  <img src={imageSmall} alt={symbol} />
);

export const View = ({
  coin,
  coins,
  coinsError,
  coinsLoading,
  coinPick,
  onChange,
  value,
}) => {
  const onChangeHandler = onChange || (e => coinPick(e.currentTarget.value));
  const controlledValue = value || (coin && coin.symbol) || '';

  return (
    <Fragment>
      {coinsError}
      {coinsLoading && '.'}
      {coins &&
        coins.length && (
          <DivSelect>
            {controlledValue !== '' && (
              <Image
                {...coins.find(({ symbol }) => symbol === controlledValue)}
              />
            )}
            <DivI symbol={controlledValue}>
              <i className="fas fa-coins" />
            </DivI>
            <Select value={controlledValue} onChange={onChangeHandler}>
              <option disabled value="" hidden>
                Crypto coins
              </option>
              {coins.map(({ name, symbol }) => (
                <option key={`coins-${symbol}`} value={symbol}>
                  {name} ({symbol})
                </option>
              ))}
            </Select>
          </DivSelect>
        )}
    </Fragment>
  );
};

class Store extends Component {
  state = { coin: null, coins: [], error: null, loading: true };

  render() {
    const { coin, coins, loading, error } = this.state;
    const { children, ...rest } = this.props;
    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            coin,
            coins,
            coinsError: error && (
              <div>There was an error fetching the coins: {error}</div>
            ),
            coinsLoading: loading,
            coinsGet: this.get,
            coinPick: this.pick,
            coinRelease: this.release,
          }),
        )}
      </Fragment>
    );
  }

  get = async () => {
    try {
      const res = await fetch(SHAPESHIFT_GETCOINS);
      const coins = await res.json();
      this.setState({ coins: Object.values(coins), loading: false });
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };

  pick = coinSymbol => {
    const coin = this.state.coins.find(({ symbol }) => symbol === coinSymbol);
    this.setState({ coin });
  };

  release = () => {
    this.setState({ coin: null });
  };
}

class Saga extends Component {
  componentDidMount() {
    this.props.coinsGet();
  }

  render() {
    const { children, ...rest } = this.props;
    return (
      <Fragment>
        {Children.map(children, child => cloneElement(child, { ...rest }))}
      </Fragment>
    );
  }
}

const store = Compose(Store, Saga);

export { store as Store };
