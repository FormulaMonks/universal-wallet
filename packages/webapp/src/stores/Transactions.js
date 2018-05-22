import React, { Component, Fragment, Children, cloneElement } from 'react';

export default class Transactions extends Component {
  state = {
    transactions: [],
    error: null,
    loading: false,
    hasTransactions: false,
  };

  componentDidMount() {
    this.check();
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
    const { transactions, loading, error, hasTransactions } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            transactions,
            transactionsHas: hasTransactions,
            transactionsLoading: loading,
            transactionsError: error && (
              <div>
                There was an error fetching the wallet transactions: {error}
              </div>
            ),
            ...rest,
          }),
        )}
      </Fragment>
    );
  }

  check = async () => {
    this.setState({
      loading: false,
      transactions: [],
      error: null,
      hasTransactions: false,
    });
    const { wallet } = this.props;
    if (!wallet) {
      return;
    }
    const { transactionsURL, transactionsProp } = wallet;
    if (!transactionsURL || !transactionsProp) {
      return;
    }
    this.get();
  };

  get = async () => {
    this.setState({
      loading: true,
      hasTransactions: true,
    });
    const {
      publicAddress,
      transactionsURL,
      transactionsProp,
    } = this.props.wallet;
    try {
      const res = await fetch(`${transactionsURL}${publicAddress}`);
      const data = await res.json();
      if (!data.hasOwnProperty(transactionsProp)) {
        this.setState({
          error: 'The response did not include the transactions property',
        });
        return;
      }
      const transactions = data[transactionsProp];
      this.setState({ transactions, loading: false });
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };
}
