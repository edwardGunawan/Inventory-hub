import React, {Component} from 'react';
import './Signup.css';
import Modal from './../Modal/Modal';
import {Button, Form, FormGroup, Label} from 'reactstrap';
// pass back to props in render()
class Signup extends Component {
  constructor(props) {
    super(props);
    this.submitSignup = this.submitSignup.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);
  }


  // validate everything from the container component App.js
  submitSignup(e) {
    e.preventDefault();
    console.log('go through herere');
    let data={};
    if(this.refs.email.value && this.refs.public_password.value &&
    this.refs.admin_password.value){
      data = {
        email: this.refs.email.value,
        admin_password:this.refs.admin_password.value,
        public_password: this.refs.public_password.value
      }
    }
    this.props.onSubmitSignUp(data);

  }

  handleOnClose() {
    this.props.onClose();
  }


  render() {
    let {errMessage,modalIsOpen} = this.props;
    console.log(errMessage, 'errMessage in signup', 'modalIsOpen', modalIsOpen);
    let renderErrMessage = () => {
      if(errMessage) return errMessage[0].message;
    }
    return (
      <div className="container">
        <Modal isOpen={modalIsOpen} onClose={this.handleOnClose}>
          {renderErrMessage()}
        </Modal>
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
          <FormGroup className="form-group">
            <Label for="publicUser">Public Username : <b>public</b></Label>
          </FormGroup>
          <FormGroup>
            <Label for="publicPassword">Public Password</Label>
            <input type="password" id="publicPassword" className="form-control" ref="public_password" placeholder="password"/>
          </FormGroup>
          <FormGroup className="form-actions">
            <Button>Signup!</Button>
            <Button onClick={e=> this.props.onBackClick()}> Back </Button>
          </FormGroup>
        </Form>
      </div>
    )
  }
}
Signup.defaultProps = {
  modalIsOpen: false
}


export default Signup;
