import React, { Fragment } from 'react';
import {
  TxStore,
  SsTxStore,
  BtcTxStore,
  BchTxStore,
  BtgTxStore,
  EthTxStore,
} from './txs';
import Compose from './Compose';
import styled from 'styled-components';
import { Leaders, Dots, Button } from '../theme';

const WrapTx = styled.div`
  background: rgba(200, 200, 200, 0.1);
  padding: 1em;
`;

const LeadersError = Leaders.extend`
  font-weight: bold;
  color: #b31313;
`;

const Title = styled.h5`
  margin: 0.5em 0 2em 0;
`;

const H5 = styled.h5`
  padding: 0;
  margin: 0;
  display: block;
`;

const DivTx = styled.div`
  overflow: auto;
  max-width: 250px;
`;

const View = ({
  txId,
  txBroadcast,
  txBroadcasting,
  txValid,
  txError,
  txChecking,
  txInfo,
}) => {
  return (
    <WrapTx>
      <Title>Transaction Details</Title>

      {!(
        txId ||
        txBroadcast ||
        txBroadcasting ||
        txValid ||
        txError ||
        txChecking ||
        txInfo
      ) && (
        <Leaders>
          Required fields
          <Dots />
          Amount and deposit address
        </Leaders>
      )}

      {!!txError && (
        <LeadersError>
          <div>Error</div>
          <Dots />
          {txError}
        </LeadersError>
      )}

      {!!txChecking && (
        <Leaders>
          <div>Status</div>
          <Dots />
          {txChecking}
        </Leaders>
      )}

      {!!txInfo &&
        !!txInfo.length &&
        txInfo.map(({ label, value }, index) => (
          <Leaders key={`tx-info-${index}`}>
            {label}
            <Dots />
            {value}
          </Leaders>
        ))}

      {!!txBroadcasting && (
        <Leaders>
          <div>Broadcast</div>
          <Dots />
          {txBroadcasting}
        </Leaders>
      )}

      {!!txValid &&
        !txBroadcasting &&
        !txId && (
          <Fragment>
            <Button onClick={txBroadcast}>Send</Button>
          </Fragment>
        )}

      {!!txId && (
        <Leaders>
          <H5>TxId</H5>
          <Dots />
          <DivTx>{txId}</DivTx>
        </Leaders>
      )}
    </WrapTx>
  );
};

const Store = ({ children, ...props }) => (
  <TxStore {...props}>
    <SsTxStore>
      <BtcTxStore>
        <BchTxStore>
          <BtgTxStore>
            <EthTxStore children={children} />
          </BtgTxStore>
        </BchTxStore>
      </BtcTxStore>
    </SsTxStore>
  </TxStore>
);

export { View, Store };
export default Compose(Store, View);
