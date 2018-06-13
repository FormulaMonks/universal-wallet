import React from 'react';
import {
  AntTxStore,
  BchTxStore,
  BtcTxStore,
  BtgTxStore,
  EthTxStore,
  SsTxStore,
  TokensTxStore,
  TxStore,
} from './txs';
import Compose from './Compose';
import styled from 'styled-components';
import { Leaders, Dots, Button } from '../theme';

const Send = Button.extend`
  display: block;
  margin: 2em auto 0;
`;

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

const DivTx = styled.div`
  word-break: break-all;
`;

const DivInfoLabel = styled.div`
  min-width: fit-content;
`;

const DivInfoVal = styled.div`
  word-break: break-all;
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
            <DivInfoLabel>{label}</DivInfoLabel>
            <Dots />
            <DivInfoVal>{value}</DivInfoVal>
          </Leaders>
        ))}

      {!!txBroadcasting && (
        <Leaders>
          <div>Broadcast</div>
          <Dots />
          {txBroadcasting}
        </Leaders>
      )}

      {!!txId && (
        <Leaders>
          <div>TxId</div>
          <Dots />
          <DivTx>{txId}</DivTx>
        </Leaders>
      )}

      <Send onClick={txBroadcast} disabled={!txValid || txBroadcasting || txId}>
        Send
      </Send>
    </WrapTx>
  );
};

const Store = ({ children, ...props }) => (
  <TxStore {...props}>
    <SsTxStore>
      <BtcTxStore>
        <BchTxStore>
          <BtgTxStore>
            <EthTxStore>
              <AntTxStore>
                <TokensTxStore children={children} />
              </AntTxStore>
            </EthTxStore>
          </BtgTxStore>
        </BchTxStore>
      </BtcTxStore>
    </SsTxStore>
  </TxStore>
);

export { View, Store };
export default Compose(Store, View);
