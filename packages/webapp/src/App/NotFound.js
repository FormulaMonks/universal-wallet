import React, { Fragment } from 'react';
import { NavHeader } from '../components';
import styled from 'styled-components';
import { SectionTitle, Section } from '../theme';

const Big = SectionTitle.extend`
  font-size: 3em;
  text-align: center;
  padding: 1em 0 0;
  color: #aaa;
`

const Msg = styled.div`
  margin: 2em;
  text-align: center;
  color: #aaa;
`;

export default () => (
  <Fragment>
    <NavHeader />
    <Section>
      <Big>404</Big>
      <Msg>
        Whooooops, we can’t find your money... just kidding, the page you
        requested does not exist.
      </Msg>
    </Section>
  </Fragment>
);
