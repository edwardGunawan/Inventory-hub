import React, {Component} from 'react';
import Main from './../Main/Main';
import Login from './../Login/Login';
import Signup from './../Signup/Signup';
const { ipcRenderer } = window.require('electron');

/*
  the status represent what the current status is, if it is
  login then it will go to main page, if it is notLogin then
  it will go to the login page
*/
class App extends Component {
  constructor(props) {
    super(props);
    this.handleSubmitLogin = this.handleSubmitLogin.bind(this);
    this.handleSubmitSignUp = this.handleSubmitSignUp.bind(this);
    this.handleClickStatus = this.handleClickStatus.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
    this.state = {
      status: 'notLogin'
    };
  }

  // Adding ComponentDidUpdate to Update between state of login and signup
  componentDidUpdate(prevProps, prevState) {
    if(this.state.status !== prevState.status) {
      switch(this.state.status) {
        case 'login' :
          this.handleSubmitLogin();
          break;
        case 'signUp' :
          this.setState({status:'signUp'});
      }
    }
  }

  // handle submitting signup button
  handleSubmitSignUp(data) {
    console.log('go through data here', data);
    ipcRenderer.send('signup', data);
    ipcRenderer.on('reply-signup', (event,arg) => {
      if(arg.status === 'Created'){
        this.setState({
          status:'notLogin'
        });
      } else {
        console.log(arg.status.errors);
        this.setState({
          errMessage: arg.status.errors
        });
      }
    });
  }

  // handle submitting login button
  handleSubmitLogin(){
    ipcRenderer.send('login-auth',this.state); // sending data to main-process
    ipcRenderer.on('reply-auth',(event,arg) => {
      console.log('arg', arg);
      if(arg !== 'notLogin'){
        this.setState({
          status:'login'
        });
      }
    });
  }

  // handle User click on Login and Signup button
  handleClickStatus(formObj) {
    console.log('go through here in handleClickStatus', formObj);
    this.setState({
      status: formObj.status
    });
  }

  // handle any backClick button for signUp
  handleBackClick() {
    this.setState({
      status:'notLogin'
    });
  }

  render() {
    let {status,errMessage} = this.state;
    let renderMain = () => {
      switch(status) {
        case 'signUp':
          return <Signup onBackClick={this.handleBackClick}
                        errMessage={errMessage}
                        onSubmitSignUp={this.handleSubmitSignUp}/>
        case 'login':
          return <Main />
        default:
          return <Login onClickStatus = {this.handleClickStatus}/>
      }
    }
    return (
      <div>
        {renderMain()}
      </div>
    )
  }
}

export default App;
