import React, {Component} from 'react';
import {Router} from 'react-router-dom';
import NavComp from '../Nav/Nav';
import MainRoute from '../Route/MainRoute';
import './Main.css';
import {Container, Row, Col} from 'reactstrap';
import createHistory from 'history/createBrowserHistory'


export const history = createHistory();
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
          <Router history={history}>
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
