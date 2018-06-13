import React, { Fragment } from 'react';
import { NavHeader, CoinsStore, CustomTokens } from '../components';
import { Section } from '../theme';

export default () => (
  <Fragment>
    <NavHeader />
    <Section>
      <CoinsStore>
        <CustomTokens />
      </CoinsStore>
    </Section>
  </Fragment>
);
