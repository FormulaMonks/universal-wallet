import React, { Fragment } from 'react';
import { CoinsStore, NavHeader, Wallets } from '../components';
import { Section } from '../theme';

export default () => (
  <Fragment>
    <NavHeader />
    <Section>
      <CoinsStore>
        <Wallets />
      </CoinsStore>
    </Section>
  </Fragment>
);
