import React, {Component} from 'react';
import InputList from '../InputList/InputList';
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
  }

  handleSubmitInputList = (state) => {
    console.log(state,' in inout submitInputList');

  }
  render() {
    return (
      <div>
        Inout Component
        <InputList
          inputField={{code:'',quantity:0}}
          insideCreate={'inout'}
          onSubmitInputList={this.handleSubmitInputList}
          />
      </div>
    )
  }
}


export default Inout;
