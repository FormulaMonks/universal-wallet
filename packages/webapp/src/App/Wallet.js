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
} from '../components';
import { Section } from '../theme';

const Home = props => (
  <Fragment>
    <div>Back to Home</div>
    <WalletView {...props} />
    <TxSetup {...props} />
    <TransactionsView {...props} />
  </Fragment>
);

export default () => (
  <Fragment>
    <NavHeader />
    <Section>
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
    </Section>
  </Fragment>
);
