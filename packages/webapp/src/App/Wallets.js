import React, { Fragment } from 'react';
import {
  CustomTokensStore,
  CoinsStore,
  NavHeader,
  Wallets,
} from '../components';
import { Section } from '../theme';

export default props => (
  <Fragment>
    <NavHeader />
    <Section>
      <CustomTokensStore>
        <CoinsStore>
          <Wallets {...props} />
        </CoinsStore>
      </CustomTokensStore>
    </Section>
  </Fragment>
);
