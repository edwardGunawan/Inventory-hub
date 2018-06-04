import React, {Component} from 'react';
import {NavLink as RRNavLink} from 'react-router-dom';
import {Nav, NavItem, NavLink} from 'reactstrap';

/*
  All Nav Bar
*/
const NavComp = ({email}) => {
  return (
    <div>
      <p>Menu</p>
      <Nav vertical>
        <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/InOut" active>Process</NavLink>
        <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/TransactionHistory">Transaction History</NavLink>
        <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Create">Create</NavLink>
        <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Delete">Delete</NavLink>
        <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Update">Update</NavLink>
        <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Restock">Restock</NavLink>
        <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Settings">Settings</NavLink>
      </Nav>
    </div>
  )
}

export default NavComp;
