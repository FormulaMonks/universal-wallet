import React from 'react';
import { toPublicAddressAvailable } from '../utils/wallets';
import styled from 'styled-components';
import { Select } from '../theme';

const DivSelect = styled.div`
  position: relative;
  height: 25px;
  width: 25px;

  & svg{
    font-size: 20px;
  }

  @media (min-width: 600px) {
    height: unset;
    width: unset;

    & svg{
      display: none;
    }
  }
`;

const SelectAssets = Select.extend`
  position: absolute;
  width: 25px;
  height: 25px;
  right: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;

  @media (min-width: 600px) {
    position: initial;
    height: 200px;
    width: 200px;
    opacity: 1;
  }
`;

export default ({ multiple, coins, tokens, assets, required, onChange }) => {
  return (
    <DivSelect>
      <i className="fas fa-coins" />
      <SelectAssets
        name="selectAssets"
        multiple={multiple}
        defaultValue={assets}
        required={required}
        onChange={onChange}
      >
        {!!coins.length && (
          <optgroup key="assets-coins" label="Crypto coins/tokens">
            {coins
              .filter(c =>
                toPublicAddressAvailable().find(o => o.symbol === c.symbol),
              )
              .map(({ name, symbol }) => (
                <option key={`assets-coins-${symbol}`} value={symbol}>
                  {name} ({symbol.toUpperCase()})
                </option>
              ))}
          </optgroup>
        )}
        {!!tokens.length && (
          <optgroup key="assets-tokens" label="Custom tokens">
            {tokens.map(({ name, symbol }) => (
              <option key={`assets-tokens-${symbol}`} value={symbol}>
                {name} ({symbol.toUpperCase()})
              </option>
            ))}
          </optgroup>
        )}
      </SelectAssets>
    </DivSelect>
  );
};
