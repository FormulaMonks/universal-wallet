import React, { Component, Fragment, Children, cloneElement } from 'react';
import { SHAPESHIFT_GETCOINS } from '../utils/ss';
import Compose from './Compose';
import styled from 'styled-components';
import { ImgFromSymbol } from './';

const DivSelect = styled.div`
  position: relative;
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

const View = ({
  coin,
  coins,
  coinsError,
  coinsLoading,
  coinPick,
  onChange,
  required,
}) => {
  const onChangeHandler = ({ currentTarget: { value } }) =>
    onChange ? onChange(value) : coinPick ? coinPick(value) : null;
  const { symbol = '' } = coin || {};

  return (
    <Fragment>
      {coinsError}
      {coinsLoading && '.'}
      {coins &&
        coins.length && (
          <DivSelect>
            <ImgFromSymbol
              coinsLoading={coinsLoading}
              coins={coins}
              symbol={symbol}
            />

            <Select
              value={symbol}
              onChange={onChangeHandler}
              name="selectSymbol"
              required={required}
            >
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
    const coin = this.state.coins.find(({ symbol }) => symbol.toLowerCase() === coinSymbol.toLowerCase());
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
    const { filterOutUnavailable, coins } = rest;
    const filteredCoins = coins.filter(
      ({ status }) => filterOutUnavailable || status !== 'unavailable',
    );
    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            coins: filteredCoins,
          }),
        )}
      </Fragment>
    );
  }
}

const SagaStore = Compose(Store, Saga);

export { SagaStore as Store, View };
export default Compose(SagaStore, View);
