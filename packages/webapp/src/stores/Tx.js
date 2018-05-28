import React, { Fragment, Children, cloneElement } from 'react';
import { BtcTxStore, EthTxStore } from './txs';

const Tx = ({ children, ...rest }) => (
  <Fragment>
    {Children.map(children, child => cloneElement(child, { ...rest }))}
  </Fragment>
);

export default ({ children, ...props }) => (
  <BtcTxStore {...props}>
    <EthTxStore>
      <Tx>{children}</Tx>
    </EthTxStore>
  </BtcTxStore>
);
