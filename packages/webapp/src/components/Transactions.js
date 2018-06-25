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
  loading: false,
};

class Store extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount() {
    const { symbol, wallet, tokens, tokensLoading } = this.props;
    if (symbol && wallet && tokens && !tokensLoading) {
      this.get();
    }
  }

  componentDidUpdate(prevProps) {
    const { symbol, wallet, tokens, tokensLoading } = this.props;
    if (
      symbol &&
      wallet &&
      tokens &&
      !tokensLoading &&
      ((!prevProps.wallet && wallet) ||
        (prevProps.wallet && prevProps.wallet.id !== wallet.id) ||
        prevProps.tokens.length !== tokens.length ||
        prevProps.tokensLoading !== tokensLoading ||
        prevProps.symbol !== symbol)
    ) {
      this.get();
    }
  }

  render() {
    const { transactions, loading, url } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            transactions,
            transactionsURL: url,
            transactionsLoading: loading,
          }),
        )}
      </Fragment>
    );
  }

  get = async () => {
    this.setState({ ...INITIAL_STATE, loading: true }, async () => {
      const { wallet: { privateKey }, tokens, symbol } = this.props;

      let transactions = [];
      const token = tokens.find(t => t.symbol === symbol);
      const url = token
        ? getTransactionURLToken(symbol)
        : getTransactionURL(symbol);
      try {
        transactions = token
          ? await getTransactionsToken(symbol)({ token, privateKey })
          : await getTransactions(symbol)(privateKey);
      } catch (e) {
        console.warn(
          `-- Could not get transaction history for ${symbol} error: `,
          e,
        );
      }
      this.setState({ transactions, url, loading: false });
    });
  };
}

const View = ({
  transactions,
  transactionsURL,
  transactionsLoading,
  wallet: { id },
}) => {
  return (
    <details>
      <summary>
        <H4>Transaction History</H4>
      </summary>

      {transactionsLoading ? (
        <Spinner />
      ) : (
        <Ul>
          {transactions.map((transaction, index) => {
            return (
              <Li key={`transactions-${id}-${index}`}>
                {typeof transaction === 'string' ? (
                  <Leaders>
                    <DivProp>Hash</DivProp>
                    <Dots />
                    <DivVal>
                      <a
                        href={`${transactionsURL}${transaction}`}
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
                          <li key={`transactions-${id}-${index}-${prop}`}>
                            <Leaders>
                              <DivProp>{prop}</DivProp>
                              <Dots />
                              <DivVal>
                                {prop.toLowerCase() === 'hash' ? (
                                  <a
                                    href={`${transactionsURL}${
                                      transaction[prop]
                                    }`}
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

export { Store, View };
export default Compose(Store, View);
