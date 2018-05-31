import React, {Component} from 'react';
import {Route} from 'react-router-dom';
// import Search from '../Search/Search';
import Inout from '../Inout/Inout';
import Settings from '../Settings/Settings';
import Analytics from '../Analytics/Analytics';
import Create from '../Create/Create';
import TransactionHistory from '../TransactionHistory/TransactionHistory';
import Restock from '../Product/Restock/Restock';
import Update from '../Product/Update/Update';
import Delete from '../Product/Delete/Delete';


/*
  put all your component in it
  Search: including Delete on Public, Edit on Admin
  Inout: will have printing invoice functionality, and updating transaction and product
  Settings: in Admin to change password for either admin or public
  Analytics: Premium Section, analytics on how they are doing throughout the month
  TransactionHistory: List of Excel Spreadsheet to download permonthly based/ till current

*/

class MainRoute extends Component {
  constructor(props) {
    super(props);
    this.handleImportExcel = this.handleImportExcel.bind(this);
  }

  handleImportExcel(path) {
    console.log(path);
  }

  render() {
    let {access} = this.props;
    if(access === 'admin_username') {
      return (
        <div>
          {/*}<Route exact path="/Search" render={() => <Search access={access}/>} /> */}
          <Route path="/Update" component={Update} />
          <Route path="/Delete" component={Delete} />
          <Route path="/Analytics" component={Analytics}/>
          <Route path="/Settings" component={Settings}/>

        </div>
      )
    } else {
      return (
        <div>
          <Route exact path="/InOut" component={Inout}/>
          <Route path="/Create" component={Create}/>
          <Route path="/TransactionHistory" component={TransactionHistory}/>
          <Route path="/Restock" component={Restock} />
        </div>
      )
    }

  }
}


export default MainRoute;
