import React, { Component, Fragment, Children, cloneElement } from 'react';
import { getBalance } from '../utils/wallets';
import { getBalance as getBalanceToken } from '../utils/tokens';
import Compose from './Compose';
import { Ul, Leaders, Dots } from '../theme';
import styled from 'styled-components';
import { Spinner, ImgFromSymbol, Currency } from './';
import { TOKENS } from '../utils/erc20';

const UNAVAILABLE = 'Currently unavailable';

const H4 = styled.h4`
  display: inline-block;
`;

const ImgWrap = styled.div`
  display: inline-block;
  margin-right: 1em;
`;

const LeadersEstimate = Leaders.extend`
  margin-left: 2em;
`;

const INITIAL_STATE = {
  balances: [],
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
    const { balances, error, loading } = this.state;
    const { children, ...rest } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            balances,
            balancesLoading: loading,
            balancesError: error,
          }),
        )}
      </Fragment>
    );
  }

  get = async () => {
    this.setState({ loading: true }, async () => {
      const {
        wallet: { assets: assetsMaybeWithoutEth, privateKey },
        tokens,
      } = this.props;
      // add eth balance if there is an er20 token or a custom token
      let assets = assetsMaybeWithoutEth;
      if (
        !assets.includes('eth') &&
        (tokens.find(t => assets.includes(t.symbol)) ||
          Object.keys(TOKENS).find(symbol => assets.includes(symbol)))
      ) {
        assets = [...assetsMaybeWithoutEth, 'eth'];
      }

      const balances = await Promise.all(
        assets.map(
          async symbol => await this.getEach({ symbol, privateKey, tokens }),
        ),
      );

      this.setState({
        balances,
        loading: false,
      });
    });
  };

  getEach = async ({ symbol, privateKey, tokens }) => {
    try {
      const token = tokens.find(t => t.symbol === symbol);
      const balance = token
        ? await getBalanceToken({ privateKey, token })
        : await getBalance(symbol)(privateKey);
      return { symbol, balance };
    } catch (e) {
      //console.warn('-- Could not get balance: ', e);
      return { symbol, balance: UNAVAILABLE };
    }
  };
}

const View = ({
  coins,
  tokens,
  balances,
  balancesError,
  balancesLoading,
  wallet,
  walletsLoading,
  coinsLoading,
  tokensLoading,
}) => {
  if (
    !wallet ||
    !balances ||
    balancesError ||
    balancesLoading ||
    walletsLoading ||
    coinsLoading ||
    tokensLoading
  ) {
    return null;
  }

  return (
    <details key={Date.now()}>
      <summary>
        <H4>Balances</H4>
      </summary>
      <Ul>
        {balances.map(({ symbol, balance }) => {
          const { name } =
            tokens.find(t => t.symbol === symbol) ||
            coins.find(c => c.symbol === symbol);
          return (
            <li key={`balances-${symbol}`}>
              <Leaders>
                <ImgWrap>
                  <ImgFromSymbol
                    coins={coins}
                    tokens={tokens}
                    symbol={symbol}
                  />
                </ImgWrap>
                {name}
                <Dots />
                {symbol.toUpperCase()} {balance}
              </Leaders>
              <LeadersEstimate>
                USD
                <Dots />
                <Currency
                  balance={balance}
                  balanceSymbol={symbol}
                  coins={coins}
                />
              </LeadersEstimate>
            </li>
          );
        })}
      </Ul>
    </details>
  );
};

const Loaded = ({ children, ...rest }) => {
  const { balancesLoading } = rest;
  if (balancesLoading) {
    return <Spinner />;
  }

  return (
    <Fragment>
      {Children.map(children, child => cloneElement(child, { ...rest }))}
    </Fragment>
  );
};

export { View, Store, Loaded };
export default Compose(Store, View);
