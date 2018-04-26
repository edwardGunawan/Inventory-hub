import React, {Component} from 'react';
import InputList from '../Input/InputList';
import InvoiceConverter from '../InvoiceConverter/InvoiceConverter';

let {ipcRenderer} = window.require('electron');
/*
  Buy/Sell Component:
    All math calculation and discount will be in frontend
    backend is handling in and out on the transaction model
*/
class Inout extends Component {
  constructor(props){
    super(props);
    this.handleSubmitInputList = this.handleSubmitInputList.bind(this);
    this.getCustomer = this.getCustomer.bind(this);
    this.state = {
      customerNames: []
    }
  }

  componentDidMount() {
    ipcRenderer.send('get-customer');
    ipcRenderer.on('reply-get-customer', (event, arg) => {
      let {message,status} = arg;
      console.log('get through here in reply-get-customer');
      console.log(message);
      if (status === 'OK') {
        this.setState({
          customerNames:message
        })
      }else {
        console.log(message);
      }
    });
  }

  componentWillUnmount(){
    ipcRenderer.removeAllListeners('get-customer');
    ipcRenderer.removeAllListeners('reply-get-customer');
  }


  handleSubmitInputList = (state) => {
    console.log(state,' in inout submitInputList');
  }

  getCustomer = () => {
    // ipcRenderer.send('get-customer');
    // ipcRenderer.on('reply-get-customer', (event, arg) => {
    //   let {message,status} = arg;
    //   console.log('get through here in reply-get-customer');
    //   if (status === 'OK') {
    //     this.setState({
    //       customerNames:message
    //     })
    //   }else {
    //     console.log(message);
    //   }
    // });
  }

  render() {
    return (
      <div>
        <InputList
          inputField={{code:'',quantity:0}}
          insideCreate={'inout'}
          onSubmitInputList={this.handleSubmitInputList}
          customerNames={this.state.customerNames}
          />
      </div>
    )
  }
}


export default Inout;
