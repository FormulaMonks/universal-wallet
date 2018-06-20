import React, { Fragment } from 'react';
import {
  AddressBookStore,
  AddressBookLoaded,
  BalancesStore,
  BalancesLoaded,
  CoinsStore,
  CoinsLoaded,
  CustomTokensStore,
  CustomTokensLoaded,
  NavHeader,
  QrReader,
  TotalCurrencyStore,
  TotalCurrencyLoaded,
  TransactionsStore,
  TransactionsView,
  TransactionsLoaded,
  TxSetup,
  WalletPick,
  WalletAssetPick,
  WalletsStore,
  WalletView,
} from '../components';
import { Section } from '../theme';

const Wallet = props => (
  <Fragment>
    <WalletView {...props} />
    <TxSetup {...props} />
    <TransactionsView {...props} />
  </Fragment>
);

export default props => (
  <Fragment>
    <NavHeader />
    <Section>
      <WalletsStore {...props}>
        <WalletPick>
          <WalletAssetPick>
            <CustomTokensStore>
              <CustomTokensLoaded>
                <CoinsStore>
                  <CoinsLoaded>
                    <BalancesStore>
                      <BalancesLoaded>
                        <TotalCurrencyStore>
                          <TotalCurrencyLoaded>
                            <TransactionsStore>
                              <TransactionsLoaded>
                                <AddressBookStore>
                                  <AddressBookLoaded>
                                    <QrReader>
                                      <Wallet />
                                    </QrReader>
                                  </AddressBookLoaded>
                                </AddressBookStore>
                              </TransactionsLoaded>
                            </TransactionsStore>
                          </TotalCurrencyLoaded>
                        </TotalCurrencyStore>
                      </BalancesLoaded>
                    </BalancesStore>
                  </CoinsLoaded>
                </CoinsStore>
              </CustomTokensLoaded>
            </CustomTokensStore>
          </WalletAssetPick>
        </WalletPick>
      </WalletsStore>
    </Section>
  </Fragment>
);
