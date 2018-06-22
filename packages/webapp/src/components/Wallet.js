import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import qr from 'qr-encode';
import { H3Wallet, DivQrPublicAddress, Leaders, Dots } from '../theme';
import { ImgFromSymbol } from './';
import { toPublicAddress } from '../utils/wallets';
import { toPublicAddress as toPublicAddressToken } from '../utils/tokens';
import styled from 'styled-components';
import { TOKENS } from '../utils/erc20';
import numberToLocale from '../utils/numberToLocale'

const UNAVAILABLE = 'Currently unavailable';

const Title = styled.h3`
  padding: 1em 0 0;
  margin: 0;

  & a {
    color: initial;
    text-decoration: none;
  }
  & a:hover {
    text-decoration: underline;
  }
`;

const View = ({
  wallet,
  match: { params: { symbol } },
  coins,
  tokens,
  balances,
  totalCurrency,
}) => {
  const { alias, privateKey, id } = wallet;
  const token = tokens.find(t => t.symbol === symbol);
  const publicAddressMaybeArray = token
    ? toPublicAddressToken(privateKey)
    : toPublicAddress(symbol)(privateKey);
  const publicAddress = Array.isArray(publicAddressMaybeArray)
    ? publicAddressMaybeArray
    : [publicAddressMaybeArray];
  const { balance } = balances.find(b => b.symbol === symbol);
  const { currency } = totalCurrency.find(c => c.symbol === symbol);

  return (
    <Fragment>
      <Title>
        ‹ <Link to={`/wallets/${id}`}>{alias}</Link>
      </Title>
      <H3Wallet>
        <ImgFromSymbol coins={coins} tokens={tokens} symbol={symbol} />
        {symbol.toUpperCase()}
      </H3Wallet>

      <DivQrPublicAddress>
        {publicAddress.map(address => (
          <Fragment key={`qr-addresses-${address}`}>
            <img src={qr(address)} alt={address} />
            <div>{address}</div>
          </Fragment>
        ))}
      </DivQrPublicAddress>

      <Leaders>
        Balance
        <Dots />
        {isNaN(balance)
          ? UNAVAILABLE
          : `${symbol.toUpperCase()} ${numberToLocale(balance)}`}
      </Leaders>

      <Leaders>
        <div>USD</div>
        <Dots />
        {isNaN(currency) ? UNAVAILABLE : '$' + numberToLocale(currency)}
      </Leaders>

      {(Object.keys(TOKENS).find(s => s === symbol) ||
        tokens.find(t => t.symbol === symbol)) && (
        <Leaders>
          Ether
          <Dots />
          ETH {numberToLocale(balances.find(b => b.symbol === 'eth').balance)}
        </Leaders>
      )}
    </Fragment>
  );
};

export default View;
