import React, {Component} from 'react';
import InputList from '../InputList/InputList';

let {ipcRenderer} = window.require('electron');

class CreateCustomer extends Component {
  constructor(props) {
    super(props);
    this.handleSubmitInputList = this.handleSubmitInputList.bind(this);
  }

  handleSubmitInputList(state) {
    let {inputList} = state;
    ipcRenderer.send('create-customer',{customer_arr:inputList});
    ipcRenderer.on('reply-create-customer', (event,arg)=>{
      let {status,message} = arg;
      if(status === 'OK') {
        console.log(message);
      }else {
        console.log(message);
      }
    });
  }

  render() {
    return (
      <div>
        <InputList insideCreate={'customer'}
                   inputField={{name:''}}
                   onSubmitInputList={this.handleSubmitInputList}/>
      </div>
    )
  }
}

export default CreateCustomer;
