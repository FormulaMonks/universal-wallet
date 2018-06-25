import React from 'react';
import styled from 'styled-components';

const Div = styled.div`
  height: 25px;
  width: 25px;
`;

const DivI = Div.extend`
  display: inline-block;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImgFromSymbol = ({
  symbol = '',
  coins = [],
  coinsLoading = false,
  tokens = [],
  tokensLoading = false,
}) => {
  if (coinsLoading || tokensLoading) {
    return null;
  }

  if (!symbol) {
    return (
      <DivI key="no-symbol">
        <i className="fas fa-coins" />
      </DivI>
    );
  }

  const coin = coins.find(c => c.symbol === symbol);
  if (coin) {
    const { imageSmall, name } = coin;
    return (
      <Div>
        <img src={imageSmall} alt={name} />
      </Div>
    );
  }

  const token = tokens.find(t => t.symbol === symbol);
  if (token) {
    return (
      <DivI key={`token-${symbol}`}>
        <i className="fab fa-empire" />
      </DivI>
    );
  }

  return (
    <DivI key="default">
      <i className="fas fa-coins" />
    </DivI>
  );
};

export default ImgFromSymbol;
