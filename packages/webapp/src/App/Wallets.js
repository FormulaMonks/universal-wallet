import React, { Fragment } from 'react';
import { CoinsStore, NavHeader, Wallets } from '../components';
import { Section } from '../theme';

export default props => (
  <Fragment>
    <NavHeader />
    <Section>
      <CoinsStore>
        <Wallets {...props} />
      </CoinsStore>
    </Section>
  </Fragment>
);
