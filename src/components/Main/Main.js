import React, {Component} from 'react';
import {Router} from 'react-router-dom';
import NavComp from '../Nav/Nav';
import MainRoute from '../Route/MainRoute';
import './Main.css';
import {Container, Row, Col} from 'reactstrap';

import createHistory from 'history/createBrowserHistory';

export const history = createHistory();
history.listen((location, action) => {
  console.log(
    `The current URL is ${location.pathname}${location.search}${location.hash}`
  )
  console.log(`The last navigation action was ${action}`)
})

/*
  All Routes must be inside Router tag
*/
class Main extends Component {
  render () {
    let {email} = this.props;
    return (
        <Container className="main-container">
          <Router history={history}>
          <Row>
            <Col xs="2" className="nav-bar">
              <NavComp email={email}/>
            </Col>
            <Col xs="10" className="main-content">
              <MainRoute email={email}/>
            </Col>
          </Row>
          </Router>
        </Container>
    )
  }
}

export default Main;
