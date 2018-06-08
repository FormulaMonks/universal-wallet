import React, { Fragment } from 'react';
import { NavHeader, CoinsStore, AddressBook, QrReader } from '../components';
import { Section } from '../theme';

export default () => (
  <Fragment>
    <NavHeader />
    <Section>
      <QrReader>
        <CoinsStore>
          <AddressBook />
        </CoinsStore>
      </QrReader>
    </Section>
  </Fragment>
);
