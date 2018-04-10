import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Main from './components/Main/Main';
import Login from './components/Login/Login';
import {Route, Switch, HashRouter, Redirect} from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';
const {ipcRenderer} = window.require('electron');

let isUserLoggedIn = () => {
  ipcRenderer.on('reply-auth', (event, arg) => {
    console.log('here in arg', arg);
    return false;
  });
};

ReactDOM.render(
  <HashRouter>
    <div>
      <Switch>
        <Route path="/login" render= {(props) => (
            isUserLoggedIn() ? <Redirect to="/"/> : <Login/>
          )}/>
        <Route exact path="/" render = {(props) => (
              isUserLoggedIn() ? <Main/> : <Redirect to="/login"/>
          )}/>
      </Switch>
    </div>
  </HashRouter>
  , document.getElementById('root'));
registerServiceWorker();
