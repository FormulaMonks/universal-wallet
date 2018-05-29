import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { signUserOut } from 'blockstack'

export default class Header extends Component {
  render() {
    return <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="wallets">Wallets</Link></li>
      <li><Link to="contacts">Contacts</Link></li>
      <li><button onClick={this.onLogout}>Logout</button></li>
    </ul>
  }

  onLogout = () => {
    signUserOut(window.location.origin)
  }
}
