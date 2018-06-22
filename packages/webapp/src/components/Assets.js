import React from 'react';
import { toPublicAddressAvailable } from '../utils/wallets';
import styled from 'styled-components';
import { Select } from '../theme';
import ReactSelect from 'react-select';
import isMobile from '../utils/isMobile';

const DivSelect = styled.div`
  position: relative;
  height: 25px;
  width: 25px;

  & svg {
    font-size: 20px;
  }
`;

const DivDesktop = styled.div`
  min-width: 250px;
  max-width: 550px;
`;

const SelectAssets = Select.extend`
  position: absolute;
  width: 25px;
  height: 25px;
  right: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
`;

const mapToOption = ({ name, symbol }) => ({
  value: symbol,
  label: `${name} (${symbol.toUpperCase()})`,
});

const reduceToOption = assets => (p, { name, symbol }) => {
  if (assets.includes(symbol)) {
    p.push({ value: symbol, label: `${name} (${symbol.toUpperCase()})` });
  }
  return p;
};

const CoinsLabel = 'Crypto coins/tokens';

const TokensLabel = 'Custom tokens';

export default ({
  multiple,
  coins,
  tokens,
  assets,
  required,
  onChange = () => {},
}) => {
  // desktop
  if (!isMobile) {
    const options = [
      {
        label: CoinsLabel,
        options: coins
          .filter(c =>
            toPublicAddressAvailable().find(o => o.symbol === c.symbol),
          )
          .map(mapToOption),
      },
      {
        label: TokensLabel,
        options: tokens.map(mapToOption),
      },
    ];
    const namedAssets = [
      ...coins.reduce(reduceToOption(assets), []),
      ...tokens.reduce(reduceToOption(assets), []),
    ];

    return (
      <DivDesktop>
        <ReactSelect
          name="selectAssets"
          delimiter=","
          closeMenuOnSelect={false}
          defaultValue={namedAssets}
          styles={{}}
          isClearable={false}
          isMulti={multiple}
          required={required}
          onChange={selected => {
            onChange(selected.map(({ value }) => value));
          }}
          options={options}
        />
      </DivDesktop>
    );
  }

  // mobile
  return (
    <DivSelect>
      <i className="fas fa-coins" />
      <SelectAssets
        name="selectAssets"
        multiple={multiple}
        defaultValue={assets}
        required={required}
        onChange={({ currentTarget: { selectedOptions } }) =>
          onChange(Array.from(selectedOptions, ({ value }) => value))
        }
      >
        {!!coins.length && (
          <optgroup key="assets-coins" label={CoinsLabel}>
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
          <optgroup key="assets-tokens" label={TokensLabel}>
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
