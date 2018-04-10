import React, {Component} from 'react';
import Main from './../Main/Main';
import Login from './../Login/Login';
const { ipcRenderer } = window.require('electron');

class App extends Component {
  constructor(props) {
    super(props);
    this.handleSubmitLogin = this.handleSubmitLogin.bind(this);
    this.state = {
      isLoggedIn : false
    };
  }

  handleSubmitLogin(data){
    console.log(data);
    ipcRenderer.send('auth',data); // sending data to main-process
    this.setState({
      isLoggedIn: true
    });
  }

  render() {
    let render = this.state.isLoggedIn ? <Main /> : <Login onSubmit = {this.handleSubmitLogin} />;
    return (
      <div>
        { render }

      </div>
    )
  }
}

export default App;
