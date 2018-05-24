import React, { Fragment, Children, cloneElement } from 'react';
import { BtcTxStore } from './txs';

const Tx = ({ children, ...rest }) => (
  <Fragment>
    {Children.map(children, child => cloneElement(child, { ...rest }))}
  </Fragment>
);

export default ({ children, ...props }) => (
  <BtcTxStore {...props}>
    <Tx>{children}</Tx>
  </BtcTxStore>
);
