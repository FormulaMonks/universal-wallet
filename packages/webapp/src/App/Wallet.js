import React, { Fragment } from 'react';
import {
  AddressBookStore,
  BalanceStore,
  CoinsStore,
  NavHeader,
  Settings,
  Spinner,
  Transactions,
  TxSetup,
  WalletView,
  WalletsStore,
  QrReader,
} from '../components';
import { Section } from '../theme';

const Wallet = props => {
  return (
    <Fragment>
      {!props.wallet && <Spinner />}
      <WalletView {...props} />
      <TxSetup {...props} />
      <Transactions {...props} />
      <Settings {...props} />
    </Fragment>
  );
};

export default props => (
  <Fragment>
    <NavHeader />
    <Section>
      <WalletsStore {...props}>
        <BalanceStore>
          <CoinsStore>
            <AddressBookStore>
              <QrReader>
                <Wallet />
              </QrReader>
            </AddressBookStore>
          </CoinsStore>
        </BalanceStore>
      </WalletsStore>
    </Section>
  </Fragment>
);
