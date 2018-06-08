import React from 'react';
import styled from 'styled-components';

const Div = styled.div`
  height: 25px;
`;

const DivI = Div.extend`
  display: inline-block;
  font-size: 20px;
`;

const ImgFromSymbol = ({ symbol, coins, coinsLoading }) => {
  if (coinsLoading) {
    return null;
  }

  if (!symbol) {
    return (
      <DivI>
        <i className="fas fa-coins" />
      </DivI>
    );
  }

  const { imageSmall, name } = coins.find(c => c.symbol === symbol);
  if (!imageSmall) {
    return (
      <DivI>
        <i className="fas fa-coins" />
      </DivI>
    );
  }

  return (
    <Div>
      <img src={imageSmall} alt={name} />
    </Div>
  );
};

export default ImgFromSymbol;
