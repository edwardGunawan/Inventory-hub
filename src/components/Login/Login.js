import React, {Component} from 'react';
import Modal from './../Modal/Modal';
import './Login.css';


class Login extends Component {
  constructor(props) {
    super(props);
    this.onClickStatus = this.onClickStatus.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);
    this.state = {
      selectedOption: 'public_username',
      modalIsOpen: this.props.modalIsOpen
    };
  }

  // handling modal for error message on login
  componentWillUpdate(nextProps, nextState) {
    console.log('go through component will update in login', this.props.errMessage, nextProps.errMessage);
    if(this.props.errMessage !== nextProps.errMessage){
      this.setState({
        modalIsOpen: true,
        errMessage: (nextProps.errMessage) ? nextProps.errMessage : nextState.errMessage
      });
    }
  }


  // handling submitting clicking either on login or signup
  onClickStatus(action){
    return () => {
      let formObj = {status:action,options:this.state.selectedOption};
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

  // handling options change on public or admin radio button
  handleOptionChange(e) {
    this.setState({
      selectedOption: e.target.value
    });
  }

  // handling onClose for modal
  handleOnClose() {
    this.setState({
      modalIsOpen: false
    });
  }

  render () {
    let {selectedOption,modalIsOpen} = this.state;
    let {errMessage} = this.props;
    let renderErrMessage = () => {
      if(errMessage) return 'Either username or password is invalid';
    }
    return (
      <div className="container">
        {'go through here again' + errMessage}
        <Modal isOpen={modalIsOpen} onClose={this.handleOnClose}>
          {renderErrMessage()}
        </Modal>
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
          <div className="radio">
            <label>
              <input type="radio" className="form-control" value="public_username"
                checked={selectedOption === 'public_username'}
                onChange={this.handleOptionChange} />
              Public
            </label>
          </div>
          <div className="radio">
            <label>
              <input type="radio" className="form-control" value="admin_username"
                checked={selectedOption === 'admin_username'}
                onChange={this.handleOptionChange}/>
              Admin
            </label>
          </div>
          <div className="form-actions">
            <button onClick={this.onClickStatus('login')} className="btn btn-form btn default" >Login</button>
            <button onClick={this.onClickStatus('signUp')} className="btn btn-form btn default" >Signup</button>
          </div>
        </form>
      </div>
    )
  }
}

Login.defaultProps = {modalIsOpen: false}

export default Login;
