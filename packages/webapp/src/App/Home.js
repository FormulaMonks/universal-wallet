import React, { Fragment } from 'react';
import {
  CoinsStore,
  ContactsStore,
  NavHeader,
  TransactionsStore,
  TransactionsView,
  TxStore,
  TxSetup,
  WalletView,
  WalletsStore,
  WalletsView,
} from '../components';
import { Section } from '../theme';

const Home = props => (
  <Fragment>
    <Section>
      <WalletsView {...props} />
    </Section>
    <WalletView {...props} />
    <TxSetup {...props} />
    <TransactionsView {...props} />
  </Fragment>
);

export default () => (
  <Fragment>
    <NavHeader />
    <WalletsStore>
      <TransactionsStore>
        <CoinsStore>
          <ContactsStore>
            <TxStore>
              <Home />
            </TxStore>
          </ContactsStore>
        </CoinsStore>
      </TransactionsStore>
    </WalletsStore>
  </Fragment>
);
