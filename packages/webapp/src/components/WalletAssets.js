import React from 'react';
import { Link } from 'react-router-dom';
import { UlGrid, LiGrid, Leaders, Dots } from '../theme';
import { ImgFromSymbol, BalanceView, BalanceInUSDView } from './';
import styled from 'styled-components';

const UNAVAILABLE = 'Currently unavailable';

const DivLeaders = Leaders.extend`
  margin-right: 1em;
`;

const DivAsset = styled.div`
  margin-top: 2px;
`;

export default props => {
  const {
    wallet,
    balances,
    balancesLoading,
    balancesInUSD,
    balancesInUSDLoading,
    coins,
    coinsLoading,
    tokens,
    tokensLoading,
  } = props;
  const { id, assets } = wallet;

  return (
    <UlGrid>
      {assets.map(symbol => {
        const { balance } = balances.find(b => b.symbol === symbol) || {
          balance: UNAVAILABLE,
        };
        const { balanceInUSD } = balancesInUSD.find(
          c => c.symbol === symbol,
        ) || {
          balanceInUSD: UNAVAILABLE,
        };

        return (
          <LiGrid key={`wallet-assets-${symbol}`}>
            <Link to={`/wallets/${id}/${symbol}`}>
              <ImgFromSymbol coins={coins} tokens={tokens} symbol={symbol} />

              <DivAsset>
                <div>{symbol.toUpperCase()}</div>
                <DivLeaders>
                  Balance
                  <Dots />
                  <BalanceView
                    {...props}
                    balanceLoading={
                      !wallet ||
                      coinsLoading ||
                      tokensLoading ||
                      balancesLoading
                    }
                    balance={balance}
                    symbol={symbol}
                  />
                </DivLeaders>

                <DivLeaders>
                  USD
                  <Dots />
                  <BalanceInUSDView
                    {...props}
                    balanceInUSDLoading={
                      !wallet ||
                      coinsLoading ||
                      tokensLoading ||
                      balancesInUSDLoading ||
                      balancesLoading
                    }
                    balanceInUSD={balanceInUSD}
                    symbol={symbol}
                  />
                </DivLeaders>
              </DivAsset>
            </Link>
          </LiGrid>
        );
      })}
    </UlGrid>
  );
};
