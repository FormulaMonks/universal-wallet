import React, { Fragment } from 'react';
import {
  BalancesStore,
  BalancesLoaded,
  CoinsStore,
  CoinsLoaded,
  CustomTokensStore,
  CustomTokensLoaded,
  NavHeader,
  Settings,
  TotalCurrencyStore,
  TotalCurrencyLoaded,
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
            <CustomTokensLoaded>
              <CoinsStore>
                <CoinsLoaded>
                  <BalancesStore>
                    <BalancesLoaded>
                      <TotalCurrencyStore>
                        <TotalCurrencyLoaded>
                          <Wallet />
                        </TotalCurrencyLoaded>
                      </TotalCurrencyStore>
                    </BalancesLoaded>
                  </BalancesStore>
                </CoinsLoaded>
              </CoinsStore>
            </CustomTokensLoaded>
          </CustomTokensStore>
        </WalletPick>
      </WalletsStore>
    </Section>
  </Fragment>
);
