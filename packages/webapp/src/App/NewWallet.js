import React, { Fragment } from 'react';
import {
  CoinsStore,
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
          <QrReader>
            <NewWallet {...props} />
          </QrReader>
        </CoinsStore>
      </WalletsStore>
    </Section>
  </Fragment>
);
