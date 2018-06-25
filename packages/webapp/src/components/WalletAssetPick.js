import React, { Component, Fragment, Children, cloneElement } from 'react';
import { Spinner } from './';

class WalletAssetPick extends Component {
  state = { loading: true, symbol: null };

  componentDidMount() {
    this.check();
  }

  render() {
    if (this.state.loading) {
      return <Spinner />;
    }
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, { ...rest, ...this.state }),
        )}
      </Fragment>
    );
  }

  check = () => {
    const { wallet, match: { params: { symbol } }, history } = this.props;

    const { assets, id } = wallet;
    if (!assets.includes(symbol)) {
      history.push(`/wallets/${id}`);
    }

    this.setState({ loading: false, symbol });
  };
}

export default WalletAssetPick;
