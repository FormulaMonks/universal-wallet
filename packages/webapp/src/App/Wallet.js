import React, { Fragment } from 'react';
import {
  Balances,
  BalancesInUSDStore,
  CoinsStore,
  CustomTokensStore,
  NavHeader,
  Settings,
  WalletAssets,
  WalletPick,
  WalletsStore,
  WifExport,
} from '../components';
import { Section, SectionTitle } from '../theme';

const Wallet = props => {
  const { wallet: { alias } } = props;

  return (
    <Fragment>
      <SectionTitle>{alias}</SectionTitle>
      <WalletAssets {...props} />
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
        <WalletPick>
          <CustomTokensStore>
            <CoinsStore>
              <Balances>
                <BalancesInUSDStore>
                  <Wallet />
                </BalancesInUSDStore>
              </Balances>
            </CoinsStore>
          </CustomTokensStore>
        </WalletPick>
      </WalletsStore>
    </Section>
  </Fragment>
);
