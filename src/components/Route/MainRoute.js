import React, {Component} from 'react';
import {Route,Redirect} from 'react-router-dom';
// import Search from '../Search/Search';
import Inout from '../Inout/Inout';
import Settings from '../Settings/Settings';
import Analytics from '../Analytics/Analytics';
import Create from '../Create/Create';
import TransactionHistory from '../TransactionHistory/TransactionHistory';
import Restock from '../Product/Restock/Restock';
import UpdateProduct from '../Product/Update/Update';
import DeleteProduct from '../Product/Delete/Delete';
import UpdateCustomer from '../Customer/Update/Update';
import DeleteCustomer from '../Customer/Delete/Delete';
import Switch from '../Switch/Switch';
import Authenticate from '../Authenticate/Authenticate';


/*
  put all your component in it
  Search: including Delete on Public, Edit on Admin
  Inout: will have printing invoice functionality, and updating transaction and product
  Settings: in Admin to change password for either admin or public
  Analytics: Premium Section, analytics on how they are doing throughout the month
  TransactionHistory: List of Excel Spreadsheet to download permonthly based/ till current

*/

const MainRoute = ({email}) => {
  return (
    <div>
      <Route exact path="/" render={() => <Redirect to="/InOut"/>}/>
      <Route path="/InOut" component={Inout}/>
      <Route path="/TransactionHistory" component={TransactionHistory}/>
      <Route path="/Create" component={Create}/>
      <Route path="/Delete" component={Switch('delete','Customer','Product')(DeleteCustomer,DeleteProduct)} />
      <Route path="/Update" component={Authenticate(Switch('update','Customer','Product')(UpdateCustomer,UpdateProduct),email)} />
      <Route path="/Restock" component={Restock} />
      <Route path="/Settings" component={Settings(email)}/>
    </div>
  )
}




export default MainRoute;
