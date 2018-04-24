import React, {Component} from 'react';
import InputList from '../InputList/InputList';
import InvoiceConverter from '../InvoiceConverter/InvoiceConverter';

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

  handleSubmitInputList = (data) => {
    // console.log(submitInputList);
  }
  render() {
    return (
      <div>
        Inout Component
      </div>
    )
  }
}


export default Inout;
