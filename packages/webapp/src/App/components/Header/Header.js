import React from 'react'
import { Link } from 'react-router-dom'

export default () => {
  return <ul>
    <li><Link to="balance">Balance</Link></li>
    <li><Link to="send">Send</Link></li>
    <li><Link to="in-wallet-exchange">In wallet exchange</Link></li>
    <li><Link to="wallets">Wallets</Link></li>
    <li><Link to="transactions">Transaction History</Link></li>
    <li><Link to="address-book">Address book</Link></li>
    <li><Link to="logout">Logout</Link></li>
  </ul>
}
