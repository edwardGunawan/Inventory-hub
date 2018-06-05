import React, {Component} from 'react';
import Main from './../Main/Main';
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
    this.state={
      render: <h1>Loading ...</h1>
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    ipcRenderer.send('get-email','');
    ipcRenderer.on('reply-get-email',(evt,data) => {
      let {status,message} = data;
      if(status === 'OK') {
        console.log(message);
        ipcRenderer.removeAllListeners('get-email');
        ipcRenderer.removeAllListeners('reply-get-email');
        if(message === 'first') {
          this.setState({
            render:<Signup onSubmit={this.handleSubmit}/>
          })
        }else {
          this.setState({
            render:<Main email={message}/>
          });
        }
      }else {
        console.log(message);
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('get-email');
    ipcRenderer.removeAllListeners('reply-get-email');
  }

  handleSubmit(email) {
    this.setState({
      render:<Main email={email}/>
    })
  }

  render() {
    return (
      <div>
        {this.state.render}
      </div>
    )
  }
}

export default App;
