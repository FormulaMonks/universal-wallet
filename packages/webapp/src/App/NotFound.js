import React, { Fragment } from 'react';
import { NavHeader } from '../components';
import styled from 'styled-components';

const Wrap = styled.div`
  margin: 2em;
  text-align: center;
  color: #aaa;
`;

const H3 = styled.h3`
  font-size: 30px;
`;

export default () => (
  <Fragment>
    <NavHeader />
    <Wrap>
      <H3>404</H3>
      <div>
        Whooooops, we can’t find your money... just joking, the page you
        requested does not exist.
      </div>
    </Wrap>
  </Fragment>
);
