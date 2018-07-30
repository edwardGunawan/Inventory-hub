import React, {Component} from 'react';
import {Button, Input, Form, FormGroup,Label,Alert} from 'reactstrap';
import {history} from '../Main/Main';
import './Settings.css';
const ipcRenderer = window.ipcRenderer;


const withClassSettings = email => funcObj => {
  return class Settings extends Component {
    constructor(props) {
      super(props);
      this.state = {
        oldPassword:'',
        newPassword:'',
        valid:false,
        invalid:false,
        email,
        disabled:true,
        alert:''
      }
      this.handleChange = this.handleChange.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
    }

    handleChange(category) {
      return (e) => {
        switch(category) {
          case 'oldPassword':
            this.setState({oldPassword:e.target.value});
            break;
          case 'newPassword':
            console.log(e.target.value);
            this.setState({
              newPassword:e.target.value
            });
          case 'retype':
            this.setState({
              valid: e.target.value === this.state.newPassword,
              invalid:e.target.value !== this.state.newPassword,
              disabled: !(e.target.value === this.state.newPassword)
            });
            break;
        }
      }
    }

    onSubmit = (option) => (e) => {
      e.preventDefault();
      let promise;
      switch(option) {
        case 'change-password':
          let {handlePasswordChange} = funcObj;
          promise = handlePasswordChange(this.state);
          promise.then((message) => {
            if(message === 'success') {
              history.push('/');
            }else {
              this.setState({alert:<Alert color="danger">{message}</Alert>});
            }
          }).catch(e => {
            this.setState({alert:<Alert color="danger">{e}</Alert>});
          })
          break;
        case 'email-password':
          let {handleEmailPassword} = funcObj;
          promise = handleEmailPassword(this.state);
          promise.then((message) => {
            console.log('message in success');
            if(message === 'success') {
              this.setState({alert:<Alert color="info">Password has been email to {this.state.email} </Alert>})
            }else {
              this.setState({alert:<Alert color="danger">{message}</Alert>});
            }
          }).catch(e => {
            this.setState({alert:<Alert color="danger">{e}</Alert>});
          })
      }
    }


    render() {

      return (
        <div>
          <p>Settings</p>
          {this.state.alert}
          <Form>
            <FormGroup className="form-group-container">
              <Label for="oldPassword">Old Password: </Label>
              <Input type="password" value={this.state.oldPassword} onChange={this.handleChange('oldPassword')} id="oldPassword" placeholder="old password"/>
            </FormGroup>
            <div className="new-password-container">
              <FormGroup className="form-group-container new-password-item">
                <Label for="newPassword">New Password: </Label>
                <Input type="password" value={this.state.newPassword} onChange={this.handleChange('newPassword')} id="newPassword" placeholder="new password"/>
              </FormGroup>
              <FormGroup className="form-group-container new-password-item">
                <Input type="password" onChange={this.handleChange('retype')} placeholder="re-type new password" valid={this.state.valid} invalid={this.state.invalid}/>
              </FormGroup>
            </div>
            <FormGroup className="form-group-container">
              <Button outline color="danger" onClick={this.onSubmit('change-password')} className="form-submit" disabled={this.state.disabled}>CHANGE PASSWORD</Button>
            </FormGroup>
          </Form>
          <Button outline color="primary" onClick={this.onSubmit('email-password')} className="form-submit">Forgot Password?</Button>
        </div>
      )
    }
  }
}

const handlePasswordChange = (state) => {
  let {oldPassword,newPassword,email} = state;
  // console.log(oldPassword,newPassword,email);
  if(oldPassword.length > 0 && newPassword.length > 0 && email) {
    let promise = new Promise((resolve,reject) => {
      ipcRenderer.send('change-password',{oldPassword,newPassword,email});
      ipcRenderer.on('reply-change-password',(evt,arg) => {
        let {status,message} = arg;
        if(status === 'OK') {
          resolve('success');
        }else {
          resolve(message);
        }
        ipcRenderer.removeAllListeners('change-password');
        ipcRenderer.removeAllListeners('reply-change-password');
      });
    });

    return promise;
  }
}

const handleEmailPassword = state => {
  let {email} = state;
  if(email) {
    let promise = new Promise((resolve,reject) => {
      ipcRenderer.send('email-notification',{email});
      ipcRenderer.on('reply-email-notification',(evt,arg) => {
        let {status,message} = arg;
        console.log('log message', message);
        if(status === 'OK') {
          resolve('success')
        } else {
          resolve(message)
        }
        ipcRenderer.removeAllListeners('email-notification');
        ipcRenderer.removeAllListeners('reply-email-notification');
      })
    })
    return promise
  }
}

const Settings = (email) => withClassSettings(email)({handlePasswordChange,handleEmailPassword});
export default Settings;
