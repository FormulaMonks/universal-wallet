import React, { Fragment } from 'react';
import { CoinsStore, NavHeader, NewWallet, WalletsStore } from '../components';
import { Section } from '../theme';

export default props => (
  <Fragment>
    <NavHeader />
    <Section>
      <WalletsStore>
        <CoinsStore>
          <NewWallet {...props} />
        </CoinsStore>
      </WalletsStore>
    </Section>
  </Fragment>
);
