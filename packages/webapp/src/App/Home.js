import React, { Fragment } from 'react';
import {
  BalanceStore,
  BalanceView,
  CoinsStore,
  ContactsStore,
  CurrencyStore,
  CurrencyView,
  Header,
  TransactionsStore,
  TransactionsView,
  TxStore,
  TxSetup,
  WalletView,
  WalletsStore,
  WalletsView,
} from '../components';

const Home = props => (
  <Fragment>
    <WalletsView {...props} />
    <WalletView {...props} />
    <BalanceView {...props} />
    <CurrencyView {...props} />
    <TxSetup {...props} />
    <TransactionsView {...props} />
  </Fragment>
);

export default () => (
  <WalletsStore>
    <BalanceStore>
      <CurrencyStore>
        <TransactionsStore>
          <CoinsStore>
            <ContactsStore>
              <TxStore>
                <Header />
                <Home />
              </TxStore>
            </ContactsStore>
          </CoinsStore>
        </TransactionsStore>
      </CurrencyStore>
    </BalanceStore>
  </WalletsStore>
);
