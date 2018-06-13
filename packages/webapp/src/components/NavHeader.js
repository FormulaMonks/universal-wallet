import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from './';
import { Ul } from '../theme';

export default () => (
  <Header>
    <Ul>
      <li>
        <Link to="/" title="Home">
          <i className="fas fa-bars" />
        </Link>
      </li>
    </Ul>
  </Header>
);
