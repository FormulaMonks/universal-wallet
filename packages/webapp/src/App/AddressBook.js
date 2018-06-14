import React, { Fragment } from 'react';
import {
  NavHeader,
  CustomTokensStore,
  CoinsStore,
  AddressBook,
  QrReader,
} from '../components';
import { Section } from '../theme';

export default () => (
  <Fragment>
    <NavHeader />
    <Section>
      <QrReader>
        <CustomTokensStore>
          <CoinsStore>
            <AddressBook />
          </CoinsStore>
        </CustomTokensStore>
      </QrReader>
    </Section>
  </Fragment>
);
