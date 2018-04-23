import React, {Component} from 'react';
import {NavLink as RRNavLink} from 'react-router-dom';
import {Nav, NavItem, NavLink} from 'reactstrap';

/*
  All Nav Bar
*/
class NavComp extends Component {
  render () {
    let {options} = this.props;
    if(options === 'admin_username') {
      return (
        <div>
          <p>Menu</p>
          <p>{options}</p>
          <Nav vertical>
            <NavItem>
              <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Search">Search</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RRNavLink} disabled activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Analytics">Report</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Settings">Settings</NavLink>
            </NavItem>
          </Nav>
        </div>
      )
    } else {
      return (
        <div>
          <p>Menu</p>
          <p>{options}</p>
          <Nav vertical>
            <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Search">Search</NavLink>
            <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Inout">In/Out</NavLink>
            <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/TransactionHistory">Transaction History</NavLink>
            <NavLink tag={RRNavLink} activeClassName="active" activeStyle={{fontWeight:"bold"}} to="/Create">Create</NavLink>
          </Nav>
        </div>
      )
    }

  }
}

export default NavComp;
