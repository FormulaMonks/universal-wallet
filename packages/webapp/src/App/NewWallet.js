import React, { Fragment } from 'react';
import {
  CoinsStore,
  CustomTokensStore,
  NavHeader,
  NewWallet,
  QrReader,
  WalletsStore,
} from '../components';
import { Section } from '../theme';

export default props => (
  <Fragment>
    <NavHeader />
    <Section>
      <WalletsStore>
        <CoinsStore>
          <CustomTokensStore>
            <QrReader>
              <NewWallet {...props} />
            </QrReader>
          </CustomTokensStore>
        </CoinsStore>
      </WalletsStore>
    </Section>
  </Fragment>
);
