import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { signUserOut } from 'blockstack'

export default class Header extends Component {
  render() {
    return <ul>
      <li><Link to="balance">Balance</Link></li>
      <li><Link to="send">Send</Link></li>
      <li><Link to="in-wallet-exchange">In wallet exchange</Link></li>
      <li><Link to="wallets">Wallets</Link></li>
      <li><Link to="transactions">Transaction History</Link></li>
      <li><Link to="address-book">Address book</Link></li>
      <li><button onClick={this.onLogout}>Logout</button></li>
    </ul>
  }

  onLogout = () => {
    signUserOut(window.location.origin)
  }
}
