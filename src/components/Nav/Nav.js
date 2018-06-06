import React, {Component} from 'react';
import {NavLink as RRNavLink} from 'react-router-dom';
import {Nav, NavItem, NavLink} from 'reactstrap';
import './Nav.css'

/*
  All Nav Bar
*/
const NavComp = ({email}) => {
  return (
    <div className="nav-bar-container">
      <Nav vertical className="side-nav-bar">
        <NavLink tag={RRNavLink} activeClassName="selected" to="/InOut">Make Transaction</NavLink>
        <NavLink tag={RRNavLink} activeClassName="selected" to="/TransactionHistory">Transaction History</NavLink>
        <NavLink tag={RRNavLink} activeClassName="selected" to="/Create">Create</NavLink>
        <NavLink tag={RRNavLink} activeClassName="selected" to="/Delete">Delete</NavLink>
        <NavLink tag={RRNavLink} activeClassName="selected" to="/Update">Update</NavLink>
        <NavLink tag={RRNavLink} activeClassName="selected" to="/Restock">Restock</NavLink>
        <NavLink tag={RRNavLink} activeClassName="selected" to="/Settings">Settings</NavLink>
      </Nav>
    </div>
  )
}

export default NavComp;
