import React, {Component} from 'react';
import {Link, BrowserRouter as Router} from 'react-router-dom';

/*
  All Nav Bar
*/
class Nav extends Component {
  render () {
    return (
      <div>
        <nav className="nav-group">
          <Link to="/Search">Search</Link>
          <Link to="/Inout">In/Out</Link>
          <Link to="/Create">Create</Link>
        </nav>
      </div>
    )
  }
}

export default Nav;
