import React from 'react';
import { Link } from 'react-router-dom';
import { UlGrid, LiGrid, Leaders, Dots } from '../theme';
import { ImgFromSymbol } from './';
import styled from 'styled-components';
import numberToLocale from '../utils/numberToLocale'

const UNAVAILABLE = 'Currently unavailable';

const DivLeaders = Leaders.extend`
  margin-right: 1em;
`;

const DivAsset = styled.div`
  margin-top: 2px;
`;

export default ({ wallet, balances, coins, tokens, totalCurrency }) => {
  const { id, assets } = wallet;

  return (
    <UlGrid>
      {assets.map(symbol => {
        const { balance } = balances.find(b => b.symbol === symbol) || {
          balance: UNAVAILABLE,
        };
        const { currency } = totalCurrency.find(c => c.symbol === symbol) || {
          currency: UNAVAILABLE,
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
                  <div>
                    {isNaN(balance)
                      ? balance
                      : `${symbol.toUpperCase()} ${numberToLocale(balance)}`}
                  </div>
                </DivLeaders>

                <DivLeaders>
                  USD
                  <Dots />
                  <div>{isNaN(currency) ? currency : '$' + numberToLocale(currency)}</div>
                </DivLeaders>
              </DivAsset>
            </Link>
          </LiGrid>
        );
      })}
    </UlGrid>
  );
};
