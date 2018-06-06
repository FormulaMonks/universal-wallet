import React, { Fragment } from 'react';
import {
  BalanceStore,
  CoinsStore,
  ContactsStore,
  NavHeader,
  Spinner,
  Transactions,
  TxSetup,
  WalletView,
  WalletsStore,
} from '../components';
import { Section } from '../theme';

const Wallet = props => {
  return (
    <Fragment>
      {!props.wallet && <Spinner />}
      <WalletView {...props} />
      <TxSetup {...props} />
      <Transactions {...props} />
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
            <ContactsStore>
              <Wallet />
            </ContactsStore>
          </CoinsStore>
        </BalanceStore>
      </WalletsStore>
    </Section>
  </Fragment>
);
