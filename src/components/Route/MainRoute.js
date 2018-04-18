import React, {Component} from 'react';
import {Route, BrowserRouter as Router} from 'react-router-dom';
import Search from '../Search/Search';
import Inout from '../Inout/Inout';
import AddRemove from '../AddRemove/AddRemove';
import Settings from '../Settings/Settings';
import Edit from '../Edit/Edit';
import BulkCreate from '../Bulk/BulkCreate';

/*
  put all your component in it
*/

class MainRoute extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {options} = this.props;
    if(options === 'admin_username') {
      return (
        <div>
          <Route path="/Search" component={Search}/>
          <Route path="/Edit" component={Edit}/>
          <Route path="/Settings" component={Settings}/>
        </div>
      )
    } else {
      return (
        <div>
          <Route path="/Search" component={Search}/>
          <Route path="/AddRemove" component={Search}/>
          <Route path="/InOut" component={Inout}/>
          <Route path="/AddRemove" component={AddRemove}/>
          <Route path="/BulkCreate" component={BulkCreate}/>
        </div>
      )
    }

  }
}


export default MainRoute;
