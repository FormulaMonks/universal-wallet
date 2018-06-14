import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Logo = styled.div`
  font-family: 'Anaheim', sans-serif;
  display: flex;
  flex-grow: 1;
  align-items: center;
  font-size: 30px;
  letter-spacing: 1px;
  color: #fff;

  & svg {
    font-size: 34px;
    padding-right: 0.5em;
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 1em;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  background: #598bc7;
  color: #fff;
  display: flex;
  align-items: center;

  & a {
    font-size: 26px;
    color: #fff;
    text-decoration: none;
    display: flex;
    align-items: center;
  }
`;

export default ({ children }) => (
  <Fragment>
    {process.env.REACT_APP_TESTNET ? <div>Testnet ON</div> : null}
    <Header>
      <Logo>
        <Link to="/wallets">
          <i className="fas fa-wallet" />DIRUA
        </Link>
      </Logo>
      {children}
    </Header>
  </Fragment>
);
