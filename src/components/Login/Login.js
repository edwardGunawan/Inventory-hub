import React, {Component} from 'react';
import './Login.css';
const { ipcRenderer } = window.require('electron');

class Login extends Component {
  constructor(props) {
    super(props);
    this.formSubmit = this.formSubmit.bind(this);
  }

  formSubmit(event) {
    event.preventDefault();
    const formObj = {
      username: this.refs.username.value,
      password: this.refs.password.value,
      path: this.refs.path.value
    }

    ipcRenderer.send('auth',formObj); // sending data to main-process
    console.log(formObj);
  }

  render () {
    return (
      <div className="container">
        <h1 className="header"> Welcome! </h1>
        <form onSubmit={this.formSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" className="form-control" ref="username" id="username" placeholder="johnDoe"/>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" className="form-control" ref="password" id="password" placeholder="password"/>
          </div>
          <div className="form-group">
            <label htmlFor="importExcel">Import Excel File</label>
            <input type="file" className="form-control" ref="path" id="importExcel"/>
          </div>
          <div className="form-actions">
            <button className="btn btn-form btn default" type="submit">Login</button>
          </div>
        </form>
      </div>
    )
  }
}

export default Login;
