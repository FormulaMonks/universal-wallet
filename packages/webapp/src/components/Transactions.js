import React, { Component, Fragment, Children, cloneElement } from 'react';
import styled from 'styled-components';
import Compose from './Compose';
import { Spinner } from './';
import { Leaders, Dots, Ul } from '../theme';

const H4 = styled.h4`
  display: inline-block;
`;

const Li = styled.li`
  font-size: 12px;
  padding: 1em;

  &:nth-child(odd) {
    background: rgba(200, 200, 200, 0.1);
  }
`;

const DivProp = styled.div`
  text-transform: capitalize;
`;

const DivVal = styled.div`
  word-break: break-all;
`;

class Store extends Component {
  state = {
    transactions: [],
    error: null,
    loading: false,
    has: false,
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
    const { transactions, loading, error, has } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            transactions,
            transactionsHas: has,
            transactionsLoading: loading,
            transactionsError: error,
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
      has: false,
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
    this.setState({ loading: true, has: true });

    const {
      publicAddress,
      transactionsURL,
      transactionsProp,
    } = this.props.wallet;

    try {
      const res = await fetch(`${transactionsURL}${publicAddress}`);
      const data = await res.json();
      if (!data.hasOwnProperty(transactionsProp)) {
        throw new Error(
          'The transaction did not include the transactions property',
        );
      }

      const transactions = data[transactionsProp];
      if (!Array.isArray(transactions)) {
        throw new Error(JSON.stringify(transactions));
      }

      this.setState({ transactions });
    } catch (e) {
      console.error('--Could not fetch transactions error: ', e);
      this.setState({
        error: 'There was an error fetching the wallet transactions',
      });
    }
    this.setState({ loading: false });
  };
}

const View = ({
  transactions,
  transactionsHas,
  transactionsLoading,
  transactionsError,
  wallet,
  walletsLoading,
}) => {
  if (!transactionsHas || walletsLoading) {
    return null;
  }
  return (
    <details>
      <summary>
        <H4>Transaction History</H4>
      </summary>
      {transactionsLoading ? (
        <Spinner />
      ) : transactionsError ? (
        <div>{transactionsError}</div>
      ) : (
        <Ul>
          {transactions.map((transaction, index) => {
            return (
              <Li key={`transactions-${wallet.id}-${index}`}>
                {typeof transaction === 'string' ? (
                  <Leaders>
                    <DivProp>Id</DivProp>
                    <Dots />
                    <DivVal>{transaction}</DivVal>
                  </Leaders>
                ) : (
                  <Fragment>
                    <Ul>
                      {Object.keys(transaction).map(prop => (
                        <li key={`transactions-${wallet.id}-${index}-${prop}`}>
                          <Leaders>
                            <DivProp>{prop}</DivProp>
                            <Dots />
                            <DivVal>{transaction[prop]}</DivVal>
                          </Leaders>
                        </li>
                      ))}
                    </Ul>
                  </Fragment>
                )}
              </Li>
            );
          })}
        </Ul>
      )}
    </details>
  );
};

export { Store, View };
export default Compose(Store, View);
