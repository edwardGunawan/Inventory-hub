import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import NavComp from '../Nav/Nav';
import MainRoute from '../Route/MainRoute';
import Search from '../Search/Search';
import Inout from '../Inout/Inout';
import Create from '../Create/Create';
import './Main.css';
import {Container, Row, Col} from 'reactstrap';



/*
  All Routes must be inside Router tag
*/
class Main extends Component {
  render () {
    let {email, options} = this.props;
    options = 'public_username';
    console.log('email is ', email, options);
    return (
        <Container>
          <Router>
          <Row>
            <Col xs="4" className="nav-bar">
              <NavComp options={options}/>
            </Col>
            <Col xs="7" className="main-content">
              Main Container
              {email}
              {options}
              <MainRoute options={options}/>
            </Col>
          </Row>
          </Router>
        </Container>
    )
  }
}

export default Main;
