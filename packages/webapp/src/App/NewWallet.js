import React, { Fragment } from 'react';
import { NavHeader, NewWallet, QrReader, WalletsStore } from '../components';
import { Section } from '../theme';

export default props => (
  <Fragment>
    <NavHeader />
    <Section>
      <WalletsStore>
        <QrReader>
          <NewWallet {...props} />
        </QrReader>
      </WalletsStore>
    </Section>
  </Fragment>
);
