import React, {Component} from 'react';
import './Signup.css';
import Modal from './../Modal/Modal';
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
        <form onSubmit={this.submitSignup}>
          <div className="form-group">
            <label htmlFor="email">(Company) Email: </label>
            <input type="email" id="email" className="form-control" ref="email" placeholder="email"/>
          </div>
          <div className="form-group">
            <label>Admin Username : <b>admin</b></label>
            <br/>
            <label htmlFor="adminPassword"> Admin Password</label>
            <input type="password" id="adminPassword" className="form-control" ref="admin_password" placeholder="password"/>
          </div>
          <div className="form-group">
            <label htmlFor="publicUser">Public Username : <b>public</b></label>
            <br/>
            <label htmlFor="publicPassword">Public Password</label>
            <input type="password" id="publicPassword" className="form-control" ref="public_password" placeholder="password"/>
          </div>
          <div className="form-actions">
            <button className="btn btn-form btn btn-default">Signup!</button>
            <button onClick={e=> this.props.onBackClick()} className="btn btn-form btn-default"> Back </button>
          </div>
        </form>
      </div>
    )
  }
}
Signup.defaultProps = {
  modalIsOpen: false
}


export default Signup;
