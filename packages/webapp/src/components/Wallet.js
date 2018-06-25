import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import qr from 'qr-encode';
import { H3Wallet, DivQrPublicAddress, Leaders, Dots } from '../theme';
import { ImgFromSymbol, Balance, BalanceView, BalanceInUSDView } from './';
import { toPublicAddress } from '../utils/wallets';
import { toPublicAddress as toPublicAddressToken } from '../utils/tokens';
import styled from 'styled-components';
import { TOKENS } from '../utils/erc20';

const Img = styled.img`
  opacity: ${({ alt }) => (alt ? 1 : 0)};
`;

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

const View = props => {
  const { wallet, symbol, tokens, tokensLoading, coinsLoading } = props;

  const { alias, privateKey, id } = wallet;
  const token = tokens.find(t => t.symbol === symbol);
  const publicAddress = tokensLoading || coinsLoading
    ? null
    : token
      ? toPublicAddressToken(privateKey)
      : toPublicAddress(symbol)(privateKey);

  return (
    <Fragment>
      <Title>
        ‹ <Link to={`/wallets/${id}`}>{alias}</Link>
      </Title>
      <H3Wallet>
        <ImgFromSymbol {...props} /> {symbol.toUpperCase()}
      </H3Wallet>

      <DivQrPublicAddress>
        <Img src={qr(publicAddress)} alt={publicAddress} />
        <div>{publicAddress}</div>
      </DivQrPublicAddress>

      <Leaders>
        Balance
        <Dots />
        <BalanceView {...props} />
      </Leaders>

      <Leaders>
        <div>USD</div>
        <Dots />
        <BalanceInUSDView {...props} />
      </Leaders>

      {(Object.keys(TOKENS).find(s => s === symbol) ||
        tokens.find(t => t.symbol === symbol)) && (
        <Leaders>
          Ether
          <Dots />
          <Balance wallet={wallet} symbol="eth" tokens={tokens} />
        </Leaders>
      )}
    </Fragment>
  );
};

export default View;
