import React, { Fragment } from 'react';
import { TxStore, SsTxStore, BtcTxStore, EthTxStore } from './txs';

export const View = ({
  txId,
  txBroadcast,
  txBroadcasting,
  txValid,
  txError,
  txChecking,
  txInfo,
}) => (
  <Fragment>
    {txError}
    {txChecking}
    {txInfo}
    {txBroadcasting}
    {txValid &&
      !txBroadcasting && !txId && (
        <Fragment>
          <div>Tx can take place</div>
          <button onClick={txBroadcast}>Send Tx</button>
        </Fragment>
      )}
    {txId && <div>Transaction id: {txId}</div>}
  </Fragment>
);

export const Store = ({ children, ...props }) => (
  <TxStore {...props}>
    <SsTxStore>
      <BtcTxStore>
        <EthTxStore children={children} />
      </BtcTxStore>
    </SsTxStore>
  </TxStore>
);
