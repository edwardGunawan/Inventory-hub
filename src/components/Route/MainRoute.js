import React, {Component} from 'react';
import {Route, BrowserRouter as Router} from 'react-router-dom';
import Search from '../Search/Search';
import Inout from '../Inout/Inout';
import Create from '../Create/Create';

/*
  put all your component in it
*/

class MainRoute extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Route path="/Search" component={Search}/>
        <Route path="/InOut" component={Inout}/>
        <Route path="/Create" component={Create}/>
      </div>
    )
  }
}


export default MainRoute;
