import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from './';
import { Ul } from '../theme';
import { signUserOut } from 'blockstack';

const NavUl = Ul.extend`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 2em;
  align-items: center;
`;

const Li = styled.li`
  & button {
    font-size: 20px;
    color: #fff;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    margin: -0.5em;
  }
`;

export default class Nav extends Component {
  render() {
    return (
      <Header>
        <NavUl>
          <Li>
            <Link to="wallets" title="Wallets">
              <i className="fas fa-credit-card" />
            </Link>
          </Li>
          <Li>
            <Link to="contacts" title="Contacts">
              <i className="far fa-address-book" />
            </Link>
          </Li>
          <Li>
            <button onClick={this.onLogout} title="Sign out">
              <i className="fas fa-sign-out-alt" />
            </button>
          </Li>
        </NavUl>
      </Header>
    );
  }

  onLogout = () => {
    signUserOut(window.location.origin);
  };
}
