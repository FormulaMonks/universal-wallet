import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Header = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 1em;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  background: #598bC7;
  color: #FFF;
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  font-family: 'Anaheim', sans-serif;
  display: inline-flex;
  align-items: center;
  font-size: 24px;
  letter-spacing: 1px;

  & svg {
    font-size: 30px;
    padding-right: 0.5em;
  }
`;

export default props => (
  <Header>
    <Logo>
      <i className="fas fa-wallet" />DIRUA
    </Logo>
    {props.children}
  </Header>
);
