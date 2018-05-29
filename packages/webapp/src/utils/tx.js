export const propsChanged = (
  { to, toSymbol, from, fromSymbol, amount, balance, privateKey, txValid },
  prevProps,
) =>
  to !== prevProps.to ||
  toSymbol !== prevProps.toSymbol ||
  from !== prevProps.from ||
  fromSymbol !== prevProps.fromSymbol ||
  amount !== prevProps.amount ||
  balance !== prevProps.balance ||
  privateKey !== prevProps.privateKey ||
  txValid !== prevProps.txValid;

export const validProps = ({
  to,
  toSymbol,
  from,
  fromSymbol,
  amount,
  balance,
  privateKey,
  txValid,
}) =>
  to &&
  toSymbol &&
  from &&
  fromSymbol &&
  amount &&
  balance &&
  privateKey &&
  txValid;
