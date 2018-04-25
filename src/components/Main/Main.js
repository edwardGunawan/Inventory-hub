import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import NavComp from '../Nav/Nav';
import MainRoute from '../Route/MainRoute';
// import Search from '../Search/Search';
// import Inout from '../Inout/Inout';
// import AddRemove from '../AddRemove/AddRemove';
import './Main.css';
import {Container, Row, Col} from 'reactstrap';



/*
  All Routes must be inside Router tag
*/
class Main extends Component {

  render () {
    let {email, access} = this.props;
    access = 'public_username';
    console.log('email is ', email, access);
    return (
        <Container>
          <Router>
          <Row>
            <Col xs="3" className="nav-bar">
              <NavComp access={access}/>
            </Col>
            <Col xs="9" className="main-content">
              Main Container
              {email}
              {access}
              <MainRoute access={access}/>
            </Col>
          </Row>
          </Router>
        </Container>
    )
  }
}

export default Main;
