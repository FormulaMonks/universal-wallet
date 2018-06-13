import React, { Fragment } from 'react';
import {
  AddressBookStore,
  BalanceStore,
  CoinsStore,
  CustomTokensStore,
  NavHeader,
  Settings,
  Spinner,
  Transactions,
  TxSetup,
  WalletView,
  WalletsStore,
  QrReader,
  WifExport,
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
      <WifExport {...props} />
    </Fragment>
  );
};

export default props => (
  <Fragment>
    <NavHeader />
    <Section>
      <WalletsStore {...props}>
        <CustomTokensStore>
          <BalanceStore>
            <CoinsStore>
              <AddressBookStore>
                <QrReader>
                  <Wallet />
                </QrReader>
              </AddressBookStore>
            </CoinsStore>
          </BalanceStore>
        </CustomTokensStore>
      </WalletsStore>
    </Section>
  </Fragment>
);
