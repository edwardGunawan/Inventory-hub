import React, {Component} from 'react';
import './Signup.css';
import {Button, Form, FormGroup, Label} from 'reactstrap';

const {ipcRenderer} = window.require('electron');
// pass back to props in render()
class Signup extends Component {
  constructor(props) {
    super(props);
    this.submitSignup = this.submitSignup.bind(this);
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('signup');
    ipcRenderer.removeAllListeners('reply-signup');
  }

  // validate everything from the container component App.js
  submitSignup(e) {
    e.preventDefault();
    console.log('go through herere');
    let data={};
    if(this.refs.email.value &&
    this.refs.admin_password.value){
      data = {
        email: this.refs.email.value,
        admin_password:this.refs.admin_password.value
      }
      ipcRenderer.send('signup', data);
      ipcRenderer.on('reply-signup', (event,arg) => {
        let {status,message} = arg;
        if(status === 'OK') {
          console.log('go through heree in main');
          this.props.onSubmit(this.refs.email.value);
        }else {
          console.log(message);
        }
      });
    }
  }


  render() {
    return (
      <div className="container">
        <Form onSubmit={this.submitSignup}>
          <FormGroup className="form-group">
            <Label for="email">(Company) Email: </Label>
            <input type="email" id="email" className="form-control" ref="email" placeholder="email"/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label>Admin Username : <b>admin</b></Label>
          </FormGroup>
          <FormGroup>
            <Label for="adminPassword"> Admin Password</Label>
            <input type="password" id="adminPassword" className="form-control" ref="admin_password" placeholder="password"/>
          </FormGroup>
          <FormGroup className="form-actions">
            <Button>Signup!</Button>
          </FormGroup>
        </Form>
      </div>
    )
  }
}


export default Signup;
