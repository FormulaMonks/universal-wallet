import React, { Component, Fragment, Children, cloneElement } from 'react';
import styled from 'styled-components';
import Compose from './Compose';
import { Spinner } from './';
import { Leaders, Dots, Ul } from '../theme';
import { getTransactions, getTransactionURL } from '../utils/wallets';
import {
  getTransactions as getTransactionsToken,
  getTransactionURL as getTransactionURLToken,
} from '../utils/tokens';

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

const INITIAL_STATE = {
  transactions: [],
  error: null,
  loading: true,
};

class Store extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    if (this.props.wallet) {
      this.get();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (!prevProps.wallet && this.props.wallet) ||
      (prevProps.wallet && prevProps.wallet.id !== this.props.wallet.id)
    ) {
      this.get();
    }
  }

  render() {
    const { transactions, loading, error } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            transactions,
            transactionsLoading: loading,
            transactionsError: error,
          }),
        )}
      </Fragment>
    );
  }

  get = async () => {
    this.setState({ ...INITIAL_STATE, loading: true }, async () => {
      const { wallet: { privateKey, assets }, tokens } = this.props;

      const transactions = await Promise.all(
        assets.map(async symbol => {
          // TODO: improve this
          // was getting errors possible because of too many requests
          // to same endpoint for all tokens
          // throttle
          await new Promise(r => setTimeout(r, 10))
          const token = tokens.find(t => t.symbol === symbol);
          const url = token
            ? getTransactionURLToken(symbol)
            : getTransactionURL(symbol);
          try {
            const transactions = token
              ? await getTransactionsToken(symbol)({ token, privateKey })
              : await getTransactions(symbol)(privateKey);
            return { symbol, transactions, url };
          } catch (e) {
            console.warn(
              `-- Could not get transaction history for ${symbol} error: `,
              e,
            );
            return { symbol, transactions: [], url };
          }
        }),
      );

      this.setState({ transactions, loading: false });
    });
  };
}

const View = ({
  transactions: transactionsAll,
  transactionsError,
  coins,
  tokens,
  wallet,
  match: { params: { symbol } },
}) => {
  const { transactions = [], url } = transactionsAll.find(
    t => t.symbol === symbol,
  );

  return (
    <details>
      <summary>
        <H4>Transaction History</H4>
      </summary>

      {transactionsError ? (
        <div>{transactionsError}</div>
      ) : (
        <Ul>
          {transactions.map((transaction, index) => {
            return (
              <Li key={`transactions-${wallet.id}-${index}`}>
                {typeof transaction === 'string' ? (
                  <Leaders>
                    <DivProp>Hash</DivProp>
                    <Dots />
                    <DivVal>
                      <a
                        href={`${url}${transaction}`}
                        target="_blank"
                        rel="nofollow"
                      >
                        {transaction}
                      </a>
                    </DivVal>
                  </Leaders>
                ) : (
                  <Fragment>
                    <Ul>
                      {Object.keys(transaction).map(prop => {
                        return (
                          <li
                            key={`transactions-${wallet.id}-${index}-${prop}`}
                          >
                            <Leaders>
                              <DivProp>{prop}</DivProp>
                              <Dots />
                              <DivVal>
                                {prop.toLowerCase() === 'hash' ? (
                                  <a
                                    href={`${url}${transaction[prop]}`}
                                    target="_blank"
                                    rel="nofollow"
                                  >
                                    {transaction[prop]}
                                  </a>
                                ) : (
                                  transaction[prop]
                                )}
                              </DivVal>
                            </Leaders>
                          </li>
                        );
                      })}
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

const Loaded = ({ children, ...rest }) => {
  const { transactionsLoading } = rest;
  if (transactionsLoading) {
    return <Spinner />;
  }

  return (
    <Fragment>
      {Children.map(children, child => cloneElement(child, { ...rest }))}
    </Fragment>
  );
};

export { Store, View, Loaded };
export default Compose(Store, View);
