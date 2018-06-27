import React, { Fragment } from 'react';
import {
  AddressBookStore,
  BalanceStore,
  BalanceInUSDStore,
  CoinsStore,
  CustomTokensStore,
  NavHeader,
  QrReader,
  ShapeShiftOrdersStore,
  ShapeShiftOrdersView,
  TransactionsStore,
  TransactionsView,
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
    <ShapeShiftOrdersView {...props} />
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
              <CoinsStore>
                <BalanceStore>
                  <BalanceInUSDStore>
                    <TransactionsStore>
                      <AddressBookStore>
                        <ShapeShiftOrdersStore>
                          <QrReader>
                            <Wallet />
                          </QrReader>
                        </ShapeShiftOrdersStore>
                      </AddressBookStore>
                    </TransactionsStore>
                  </BalanceInUSDStore>
                </BalanceStore>
              </CoinsStore>
            </CustomTokensStore>
          </WalletAssetPick>
        </WalletPick>
      </WalletsStore>
    </Section>
  </Fragment>
);
