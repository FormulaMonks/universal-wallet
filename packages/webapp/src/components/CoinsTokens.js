import React from 'react';
import { ImgFromSymbol } from './';
import { DivSelect, Select } from '../theme';

const CoinsTokens = props => {
  const { coinsLoading, tokensLoading } = props;
  if (coinsLoading || tokensLoading) {
    return null;
  }

  const { coins, coin, tokens, token, required, onChange } = props;
  const onChangeHandler = ({ currentTarget: { value } }) => onChange(value);
  const { symbol = '' } = coin || token || {};

  if (!tokens.length && !coins.length) {
    return 'Currently unavailable';
  }

  return (
    <DivSelect>
      <ImgFromSymbol
        coinsLoading={coinsLoading}
        coins={coins}
        tokensLoading={tokensLoading}
        tokens={tokens}
        symbol={symbol}
      />

      <Select
        value={symbol}
        onChange={onChangeHandler}
        name="selectSymbol"
        required={required}
      >
        <option key="coins-tokens-symbol-disabled" disabled value="" hidden>
          Crypto coins & Custom Tokens
        </option>
        {coins.length && (
          <optgroup key="coins-tokens-coin-label" label="Address Book">
            {coins.map(({ name, symbol }) => (
              <option key={`coins-tokens-coin-${symbol}`} value={symbol}>
                {name} ({symbol.toUpperCase()})
              </option>
            ))}
          </optgroup>
        )}
        {tokens.length && (
          <optgroup key="coins-tokens-token-label" label="Custom Tokens">
            {tokens.map(({ name, symbol, id }) => (
              <option key={`coins-tokens-token-${symbol}`} value={symbol}>
                {name} ({symbol.toUpperCase()})
              </option>
            ))}
          </optgroup>
        )}
      </Select>
    </DivSelect>
  );
};

export default CoinsTokens;
