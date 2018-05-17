import React, { Component, Fragment, Children, cloneElement } from 'react';
import { SHAPESHIFT_GETCOINS } from '../utils/constants';

export default class Coins extends Component {
  state = {
    coins: [],
    error: null,
    loading: true,
  };

  componentDidMount() {
    this.fetch();
  }

  render() {
    const { coins, loading, error } = this.state;
    const { children, ...rest } = this.props
    return (
      <Fragment>
        {Children.map(this.props.children, child =>
          cloneElement(child, {
            coins,
            coinsError: error && (
              <div>There was an error fetching the coins: {error}</div>
            ),
            coinsLoading: loading,
            coinsFetch: this.fetch,
            ...rest,
          }),
        )}
      </Fragment>
    );
  }

  fetch = async () => {
    try {
      const res = await fetch(SHAPESHIFT_GETCOINS);
      const coins = await res.json();
      this.setState({ coins: Object.values(coins), loading: false });
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };
}
