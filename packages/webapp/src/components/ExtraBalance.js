import React from 'react';
import { Leaders, Dots } from '../theme';

const ExtraBalance = ({ balance }) => {
  if (!Array.isArray(balance)) {
    return null;
  }

  return (
    <Leaders>
      <div>Ether</div>
      <Dots />
      <div>
        {Number.isNaN(balance[1]) ? 'Currently unavailable' : `ETH ${balance[1]}`}
      </div>
    </Leaders>
  );
};

export default ExtraBalance;
