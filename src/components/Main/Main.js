import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import Nav from '../Nav/Nav';
import MainRoute from '../Route/MainRoute';
import Search from '../Search/Search';
import Inout from '../Inout/Inout';
import Create from '../Create/Create';


/*
  All Routes must be inside Router tag
*/
class Main extends Component {
  render () {
    let {email, options} = this.props;
    console.log('email is ', email, options);
    return (
      <Router>
        <div>
          <Nav/>
          Main Container
          {email}
          {options}
          <MainRoute/>
        </div>
      </Router>

    )
  }
}

export default Main;
