import React, {Component} from 'react';
import Modal from './../Modal/Modal';
import './Login.css';
import {Button, Form, FormGroup, Label} from 'reactstrap';


class Login extends Component {
  constructor(props) {
    super(props);
    this.onClickStatus = this.onClickStatus.bind(this);
    this.handleAccessChange = this.handleAccessChange.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);
    this.state = {
      selectedAccess: 'public_username'
    };
  }

  // handling submitting clicking either on login or signup
  onClickStatus(action){
    return () => {
      let formObj = {status:action,access:this.state.selectedAccess};
      if(action === 'aboutLogin') {
        if(this.refs.email.value && this.refs.password.value) {
          formObj = {
            ...formObj, // spread operator for adding status in the formObj
            password: this.refs.password.value,
            email:this.refs.email.value
          }
        } else {
          formObj.status = 'notLogin';
        }
      }
      this.props.onClickStatus(formObj);
    }
  }

  // handling access change on public or admin radio button
  handleAccessChange(e) {
    this.setState({
      selectedAccess: e.target.value
    });
  }

  // handling onClose for modal
  // rendering the entire modal from container component app.js
  // modalIsOpen and the error message
  handleOnClose() {
    this.props.onClose();
  }

  render () {
    let {selectedAccess} = this.state;
    let {errMessage,modalIsOpen} = this.props;
    // console.log(modalIsOpen, ' in login');
    let renderErrMessage = () => {
      if(errMessage) return errMessage;
    }
    return (
      <Form className="login-container">
        <Modal isOpen={modalIsOpen} onClose={this.handleOnClose}>
          {renderErrMessage()}
        </Modal>
        <h1 className="header"> Welcome! </h1>
        <div>
          <FormGroup className="form-group">
            <Label for="email">Email</Label>
            <input type="text" className="form-control" ref="email" id="email" placeholder="email"/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label for="password">Password</Label>
            <input type="password" className="form-control" ref="password" id="password" placeholder="password"/>
          </FormGroup>
          <FormGroup tag="fieldset" className="radio">
            <FormGroup check>
              <Label check>
                <input type="radio" className="form-control" value="public_username"
                  checked={selectedAccess === 'public_username'}
                  onChange={this.handleAccessChange} />
                Public
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <input type="radio" className="form-control" value="admin_username"
                  checked={selectedAccess === 'admin_username'}
                  onChange={this.handleAccessChange}/>
                Admin
              </Label>
            </FormGroup>
          </FormGroup>
          <FormGroup className="form-actions">
            <Button onClick={this.onClickStatus('aboutLogin')} className="btn btn-form btn default" >Login</Button>
            <Button onClick={this.onClickStatus('signUp')} className="btn btn-form btn default" >Signup</Button>
          </FormGroup>
        </div>
      </Form>
    )
  }
}

Login.defaultProps = {modalIsOpen: false}

export default Login;
