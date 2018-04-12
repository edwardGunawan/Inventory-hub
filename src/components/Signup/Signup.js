import React, {Component} from 'react';
import './Signup.css';
import Modal from './../Modal/Modal';
// pass back to props in render()
class Signup extends Component {
  constructor(props) {
    super(props);
    this.submitSignup = this.submitSignup.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);
    this.state = {
      modalIsOpen: false
    }
  }

  componentWillUpdate(nextProps, nextState) {
    console.log(this.props.errMessage, nextProps.errMessage);
    if(this.props.errMessage !== nextProps.errMessage){
      this.setState({
        modalIsOpen: true,
        errMessage: (nextProps.errMessage) ? nextProps.errMessage : nextState.errMessage
      });
    }

  }



  submitSignup(e) {
    e.preventDefault();
    console.log('go through herere');
    if(!this.refs.email.value || !this.refs.admin_username.value ||
    !this.refs.admin_password.value || !this.refs.public_username.value){
      this.setState({
        errMessage: [{message:'All Form Field Must be Filled'}],
        modalIsOpen:true
      });
    }else {
      const data = {
        email: this.refs.email.value,
        admin_username: this.refs.admin_username.value,
        admin_password:this.refs.admin_password.value,
        public_username: this.refs.public_username.value,
        public_password: this.refs.public_password.value
      }
      this.props.onSubmitSignUp(data);
    }

  }

  handleOnClose() {
    this.setState({
      modalIsOpen: false
    });
  }


  render() {
    let {errMessage} = this.state;
    let renderErrMessage = () => {
      if(errMessage) return errMessage[0].message;
    }
    return (
      <div className="container">
        <Modal isOpen={this.state.modalIsOpen} onClose={this.handleOnClose}>
          {renderErrMessage()}
        </Modal>
        <form onSubmit={this.submitSignup}>
          <div className="form-group">
            <label htmlFor="email">Admin/Company Email: </label>
            <input type="email" id="email" className="form-control" ref="email" placeholder="email"/>
          </div>
          <div className="form-group">
            <label htmlFor="adminUser">Admin Username</label>
            <input type="text" id="adminUser" className="form-control" ref="admin_username" placeholder="admin"/>
            <label htmlFor="adminPassword"> Admin Password</label>
            <input type="password" id="adminPassword" className="form-control" ref="admin_password" placeholder="password"/>
          </div>
          <div className="form-group">
            <label htmlFor="publicUser">Public Username</label>
            <input type="text" id="publicUser" className="form-control" ref="public_username" placeholder="public"/>
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


export default Signup;
