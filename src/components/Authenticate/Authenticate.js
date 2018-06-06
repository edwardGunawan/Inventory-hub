import React, {Component} from 'react';
import {Input,Button} from 'reactstrap';
import './Authenticate.css'

const {ipcRenderer} = window.require('electron');

const withAuthenticateClass = defaultState => BaseComponent => AuthComponent => {
  return class Authenticate extends Component {
    constructor(props) {
      super(props);
      this.state = {
        isAuth: false,
        email: defaultState.email,
        password:''
      }
      this.handleClick = this.handleClick.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }


    // handleClick on authenticate
    handleClick(e) {
      e.preventDefault();
      let {email,password} = this.state;
      ipcRenderer.send('login-auth',{email,password});
      ipcRenderer.on('reply-login-auth',(evt,arg) => {
        let {message,status} = arg;
        if(status === 'OK') {
          this.setState({
            isAuth:true
          });
          ipcRenderer.removeAllListeners('login-auth');
          ipcRenderer.removeAllListeners('reply-login-auth');
        }else {
          //TODO modal
          console.log(message);
        }
      })
    }

    handleChange(e) {
      this.setState({password:e.target.value});
    }

    render() {
      let {isAuth} = this.state;
      return (
        <div>
          {(isAuth)?<BaseComponent/>:<AuthComponent onClick={this.handleClick} onChange={this.handleChange} {...this.state}/>}
        </div>
      )
    }
  }
}

/**
  props:
    password, onChange, onSubmit
  */
const AuthComponent = ({email,onClick,onChange,password}) => {
  return (
    <div className="authenticate-container">
      <h1>Admin User</h1>
      <Input type="password" placeholder="password" value={password} onChange={onChange}/>
      <Button onClick={onClick} color="primary" outline >ENTER</Button>
    </div>
  )
}



/**
  Authenticate took BaseComponent and email to authenticate the password
*/
const Authenticate = (BaseComponent,email) => withAuthenticateClass({email})(BaseComponent)(AuthComponent)

export default Authenticate;
