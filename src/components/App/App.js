import React, {Component} from 'react';
import Main from './../Main/Main';
import Login from './../Login/Login';
import Signup from './../Signup/Signup';
const { ipcRenderer } = window.require('electron');

/*
  the status represent what the current status is, if it is
  login then it will go to main page, if it is notLogin then
  it will go to the login page


  Process is when user do login, it will go through the handler,
  then the handler will change the state, and go to componentDidUpdate
  then run the function

  If user just click login without anything, it will go through
  handleClickStatus, then to login componentWillUpdate, then to
  ComponentDidUpdate in App.js

  All of the modal are all changed through the App.js

  Container Component
*/
class App extends Component {
  constructor(props) {
    super(props);
    this.handleSubmitLogin = this.handleSubmitLogin.bind(this);
    this.handleSubmitSignUp = this.handleSubmitSignUp.bind(this);
    this.handleClickStatus = this.handleClickStatus.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.state = {
      status: 'notLogin'
    };
  }

  // Adding ComponentDidUpdate to Update between state of login and signup
  componentDidUpdate(prevProps, prevState) {
    console.log('go through componentDidUpdate in app.js', this.state.status, prevState.status);
    if(this.state.status !== prevState.status) {
      switch(this.state.status) {
        case 'aboutLogin' :
          this.handleSubmitLogin();
          break;
        case 'signUp' :
          this.setState({status:'signUp'});
      }
    }
  }

  // handle submitting signup button
  handleSubmitSignUp(data) {
    console.log('go through data here');
    let {email,public_password,admin_password} = data;
    // validate here and send it back to signUp.js
    if(!email || !public_password || !admin_password) {
      console.log('get through exception');
      this.setState({
        errMessage:[{message:'Ooops! You have to fill out all the field'}],
        modalIsOpen:true
      });
    }else {
      ipcRenderer.send('signup', data);
      ipcRenderer.on('reply-signup', (event,arg) => {
        if(arg.status === 'Created'){
          this.setState({
            status:'notLogin'
          });
        } else {
          console.log(arg.status.errors);
          this.setState({
            errMessage: arg.status.errors,
            modalIsOpen:true
          });
        }
      });
    }
  }

  // handle submitting login button
  handleSubmitLogin(){
    console.log(this.state);
    ipcRenderer.send('login-auth',this.state); // sending data to main-process
    ipcRenderer.on('reply-auth',(event,arg) => {
      // console.log('arg', arg);
      if(arg.status === 'OK'){
        console.log(arg);
        let {email, options} = arg.message;
        this.setState({
          status:'login',
          email,
          options
        });
      } else {
        console.log(arg.message);
        // console.log(this.state.status);
        this.setState({
          errMessage:arg.message,
          status:'notLogin',
          modalIsOpen:true
        });
      }
    });
  }

  // handle User click on Login and Signup button
  handleClickStatus(formObj) {
    console.log('go through here in handleClickStatus', formObj);
    // if the formObj has something else and it is login then go through login
    if(formObj.status === 'aboutLogin') {
      this.setState(formObj);
    } else {
      // means it is only created
      this.setState({
        status: formObj.status
      });
    }

  }

  // handle any backClick button for signUp
  handleBackClick() {
    this.setState({
      status:'notLogin'
    });
  }

  handleCloseModal() {
    this.setState({
      errMessage:'',
      modalIsOpen:false
    });
  }

  render() {
    let {status,errMessage,modalIsOpen,email,options} = this.state;
    console.log('email', email, 'options',options,'status',status, 'errMessage', errMessage);
    let renderMain = () => {
      switch(status) {
        case 'signUp':
          return <Signup onBackClick={this.handleBackClick}
                        errMessage={errMessage}
                        onSubmitSignUp={this.handleSubmitSignUp}
                        onClose={this.handleCloseModal}
                        modalIsOpen={modalIsOpen}/>
        case 'login':
          return <Main email={email}
                       options={options}/>
        default:
          return <Login errMessage={errMessage}
                        onClickStatus = {this.handleClickStatus}
                        onClose={this.handleCloseModal}
                        modalIsOpen={modalIsOpen}/>
      }
    }
    return (
      <div>
        {/*renderMain()*/}
        {<Main email={email}
                     options={options}/>}
      </div>
    )
  }
}

export default App;
