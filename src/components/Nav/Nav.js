import React, {Component} from 'react';
import {Link, BrowserRouter as Router} from 'react-router-dom';
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
            <NavLink tag={Link} to="/Search">Search</NavLink>
            <NavLink tag={Link} to="/Edit">Edit</NavLink>
            <NavLink tag={Link} to="/Settings">Settings</NavLink>
          </Nav>
        </div>
      )
    } else {
      return (
        <div>
          <p>Menu</p>
          <p>{options}</p>
          <Nav vertical>
            <NavLink tag={Link} to="/Search">Search</NavLink>
            <NavLink tag={Link} to="/Inout">In/Out</NavLink>
            <NavLink tag={Link} to="/AddRemove">Create/Delete</NavLink>
            <NavLink tag={Link} to="/BulkCreate">Import</NavLink>
          </Nav>
        </div>
      )
    }

  }
}

export default NavComp;
