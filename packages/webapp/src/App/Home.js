import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { NavHeader } from '../components';
import { Section, Ul, Button } from '../theme';
import { signUserOut, loadUserData } from 'blockstack';
import styled from 'styled-components';

const Img = styled.img`
  display: block;
  height: 150px;
  width: 150px;
  border-radius: 50%;
  box-shadow: 0 0 4px 1px #ccc;
  margin: auto;
`;

const SectionWrap = Section.extend`
  text-align: center;
  padding-top: 1em;
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 1em;
`;

const UlLinks = Ul.extend`
  display: grid;
  grid-gap: 1em;

  & button {
    width: 200px;
  }
`;

const Div = styled.div`
  font-weight: bold;
`;

export default props => {
  const {
    username,
    profile: {
      image: [{ contentUrl = 'https://picsum.photos/200?random' } = {}] = [],
      name,
    } = {},
  } = loadUserData();

  return (
    <Fragment>
      <NavHeader />
      <SectionWrap>
        <Img src={contentUrl} alt={name} title={name} />
        <Div>{name || username}</Div>
        <UlLinks>
          <li>
            <Link to="/wallets">
              <Button>My wallets</Button>
            </Link>
          </li>
          <li>
            <Link to="/address-book">
              <Button>Address Book</Button>
            </Link>
          </li>
          <li>
            <Link to="/custom-tokens">
              <Button>Custom Tokens</Button>
            </Link>
          </li>
          <li>
            <Button onClick={() => signUserOut(window.location.origin)}>
              Sign out
            </Button>
          </li>
        </UlLinks>
      </SectionWrap>
    </Fragment>
  );
};
