import React, {Component} from 'react';
import {Button, Input, Form, FormGroup,Label} from 'reactstrap';
import {history} from '../Main/Main';
import './Settings.css';
const {ipcRenderer} = window.require('electron');


const withClassSettings = email => handleSubmit => {
  return class Settings extends Component {
    constructor(props) {
      super(props);
      this.state = {
        oldPassword:'',
        newPassword:'',
        valid:false,
        invalid:false,
        email,
        disabled:true
      }
      this.handleChange = this.handleChange.bind(this);
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


    render() {

      return (
        <div>
          <h2>Settings</h2>
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
              <Button outline color="danger" onClick={handleSubmit(this.state)} className="form-submit" disabled={this.state.disabled}>CHANGE PASSWORD</Button>
            </FormGroup>
          </Form>
        </div>
      )
    }
  }
}

const handleSubmit = (state) => e => {
  e.preventDefault();
  let {oldPassword,newPassword,email} = state;
  console.log(oldPassword,newPassword,email);
  if(oldPassword.length > 0 && newPassword.length > 0 && email) {
    ipcRenderer.send('change-password',{oldPassword,newPassword,email});
    ipcRenderer.on('reply-change-password',(evt,arg) => {
      let {status,message} = arg;
      if(status === 'OK') {
        history.push('/');
      }else {
        console.log(message);
      }
    })
  }

}

const Settings = (email) => withClassSettings(email)(handleSubmit);
export default Settings;
