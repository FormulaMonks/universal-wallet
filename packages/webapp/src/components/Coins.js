import React, { Component, Fragment, Children, cloneElement } from 'react';
import { SHAPESHIFT_GETCOINS } from '../utils/constants';
import composeStore from '../utils/composeStore';

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
      {coinsLoading ? (
        <div>loading</div>
      ) : (
        <select value={controlledValue} onChange={onChangeHandler}>
          <option disabled value="" hidden>
            Coins
          </option>
          {coins.map(({ name, symbol }) => (
            <option key={`coins-${symbol}`} value={symbol}>
              {name} ({symbol})
            </option>
          ))}
        </select>
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

const store = composeStore(Store, Saga);

export { store as Store };
