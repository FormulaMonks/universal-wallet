import React, { Component, Fragment, Children, cloneElement } from 'react';
import Compose from './Compose';

const INITIAL_STATE = {
  balance: null,
  error: null,
  loading: false,
};

class Store extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    if (this.props.wallet) {
      this.check();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (!prevProps.wallet && this.props.wallet) ||
      (prevProps.wallet && prevProps.wallet.id !== this.props.wallet.id)
    ) {
      this.check();
    }
  }

  render() {
    const { balance, error, loading } = this.state;
    const { children, ...rest } = this.props;
    const { wallet } = rest;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            balance,
            balanceSymbol: wallet && wallet.symbol,
            balanceLoading: loading,
            balanceError: error,
          }),
        )}
      </Fragment>
    );
  }

  check = async () => {
    this.setState({ ...INITIAL_STATE }, () => {
      const { balanceURL, balanceProp, balanceUnit } = this.props.wallet;
      if (!balanceURL || !balanceProp || !balanceUnit) {
        this.setState({
          error: <div>Currently unavailable</div>,
          loading: false,
        });
        return;
      }
      this.get();
    });
  };

  get = async () => {
    this.setState({ loading: true });
    const {
      publicAddress,
      balanceURL,
      balanceProp,
      balanceUnit,
    } = this.props.wallet;
    try {
      const res = await fetch(`${balanceURL}${publicAddress}`);
      const data = await res.json();
      if (!data.hasOwnProperty(balanceProp)) {
        this.setState({
          error: (
            <div>
              There was an error getting the wallet balance: the response did
              not include the balance property
            </div>
          ),
        });
        return;
      }
      const balance = data[balanceProp] * balanceUnit;
      this.setState({ balance });
    } catch (e) {
      this.setState({
        error: <div>Currently unavailable</div>,
      });
    }
    this.setState({ loading: false });
  };
}

const View = ({ balance, balanceSymbol, balanceError, balanceLoading }) => {
  if (!balance && balance !== 0 && !balanceError && !balanceLoading) {
    return null;
  }

  return (
    <Fragment>
      {balanceError}
      {balanceLoading && '.'}
      {balance && (
        <Fragment>
          {balanceSymbol} {balance}
        </Fragment>
      )}
    </Fragment>
  );
};

export { View, Store };
export default Compose(Store, View);
