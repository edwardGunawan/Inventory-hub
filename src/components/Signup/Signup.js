import React, {Component} from 'react';
import './Signup.css';
import {Button, Form, FormGroup, Label,Alert} from 'reactstrap';

const ipcRenderer = window.ipcRenderer;

class Signup extends Component {
  constructor(props) {
    super(props);
    this.submitSignup = this.submitSignup.bind(this);
    this.state = {
      alert:''
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('signup');
    ipcRenderer.removeAllListeners('reply-signup');
  }


  submitSignup(e) {
    e.preventDefault();
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
          this.props.onSubmit(this.refs.email.value);
          ipcRenderer.removeAllListeners('signup');
          ipcRenderer.removeAllListeners('reply-signup');
        }else {
          console.log(message);
          this.setState({alert: <Alert color="danger">{message.errors[0].message}</Alert>});
        }
      });
    }
  }


  render() {
    return (
      <div className="signup-container">
        <Form onSubmit={this.submitSignup} className="signup-form">
          <p id="title">Welcome to Inventory-Hub!</p>
          {this.state.alert}
          <Label className="signup-label" for="email">(Company) Email: </Label>
          <input type="email" id="email" className="form-control" ref="email" placeholder="email"/>
          <Label className="signup-label" for="adminPassword"> Admin Password: </Label>
          <input type="password" id="adminPassword" className="form-control" ref="admin_password" placeholder="password"/>
          <FormGroup className="form-actions">
            <Button outline color="primary">Create!</Button>
          </FormGroup>
        </Form>
      </div>
    )
  }
}


export default Signup;
