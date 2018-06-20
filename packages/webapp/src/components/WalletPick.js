import React, { Component, Fragment, Children, cloneElement } from 'react';
import { Spinner } from './';

class WalletPick extends Component {
  componentDidMount() {
    this.check();
  }

  componentDidUpdate(prevProps) {
    const {
      match: { params: { id } },
      wallets,
      walletsLoading,
    } = this.props;
    if (
      id !== prevProps.match.params.id ||
      walletsLoading !== prevProps.walletsLoading ||
      wallets.length !== prevProps.wallets.length
    ) {
      this.check();
    }
  }

  render() {
    const { children, ...rest } = this.props;
    const { wallet } = rest;
    if (!wallet) {
      return <Spinner />;
    }

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
      return;
    }
  };
}

export default WalletPick;
