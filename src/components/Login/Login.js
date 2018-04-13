import React, {Component} from 'react';
import './Login.css';


class Login extends Component {
  constructor(props) {
    super(props);
    this.onClickStatus = this.onClickStatus.bind(this);
  }


  onClickStatus(action){
    return () => {
      let formObj = {status:action};
      if(action === 'login') {
        if(this.refs.username.value && this.refs.password.value) {
          formObj = {
            ...formObj, // spread operator for adding status in the formObj
            username: this.refs.username.value,
            password: this.refs.password.value
          }
        } else {
          formObj.status = 'notLogin';
        }
      }

      this.props.onClickStatus(formObj);
    }
  }

  render () {
    return (
      <div className="container">
        <h1 className="header"> Welcome! </h1>
        <form>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" className="form-control" ref="username" id="username" placeholder="johnDoe"/>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" className="form-control" ref="password" id="password" placeholder="password"/>
          </div>
          {/*<div className="form-group">
            <label htmlFor="importExcel">Import Excel File</label>
            <input type="file" className="form-control" ref="path" id="importExcel"/>
          </div> */}
          <div className="form-actions">
            <button onClick={this.onClickStatus('login')} className="btn btn-form btn default" >Login</button>
            <button onClick={this.onClickStatus('signUp')} className="btn btn-form btn default" >Signup</button>
          </div>
        </form>
      </div>
    )
  }
}

export default Login;
