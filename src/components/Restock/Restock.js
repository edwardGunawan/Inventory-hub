import React, {Component} from 'react';
import ShowTable from '../ShowTable/ShowTable';
import InputField from '../Input/InputField';
import RestockInputField from '../Input/RestockInputField';
import {Button} from 'reactstrap';

const {ipcRenderer} = window.require('electron');

class Restock extends Component {
  constructor(props) {
    super(props);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleClickAction = this.handleClickAction.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toOptions = this.toOptions.bind(this);
    this.getProduct = this.getProduct.bind(this);
    this.state = {
      tableHeader:['Code','Brand', 'Quantity', 'Price','Action'],
      tableBody:[],
      productItems:[]
    }
  }

  componentDidMount() {
    this.getProduct();
  }

  componentWillUnmount(){
    ipcRenderer.removeAllListeners('get-product');
    ipcRenderer.removeAllListeners('reply-get-product');
    ipcRenderer.removeAllListeners('restock');
    ipcRenderer.removeAllListeners('reply-restock');
  }

  handleClickAction(idx) {
    // decreasing the value of the tableBody
    this.setState({
      tableBody: this.state.tableBody.filter((obj,i) => i!==idx)
    });
  }

  handleSubmitClick(newItemObj) {
    // console.log(this.state.tableBody);
    let {code} = newItemObj;
    let foundIndex = this.state.tableBody.findIndex((it) => it.code === code);
    if(foundIndex === -1) {
      this.setState({
        tableBody: this.state.tableBody.concat(newItemObj)
      });
    }else {
      // TODO warning for item has been submitting to buffer restock
    }

  }

  handleSubmit(e) {
    e.preventDefault();
    let {tableBody} = this.state;
    if(tableBody.length > 0) {
      ipcRenderer.send('restock',{input_arr:tableBody});
      ipcRenderer.on(`reply-restock`, (event,arg)=>{
        let {status,message} = arg;
        if(status === 'OK') {
          // console.log(message);
          // console.log('here after create');
          this.props.history.replace('/InOut'); // reroute to search
        }else {
          console.log(message);
        }
      });
    }
  }


  toOptions(productItems) {
    return productItems.map((product) => {
      return {value:product.code,label:product.code};
    });
  }

  getProduct() {
    ipcRenderer.send('get-product','');
    ipcRenderer.on('reply-get-product', (event,arg) => {
      let {message,status} = arg;
      if(status === 'OK') {
        this.setState({productItems : message});
        ipcRenderer.removeAllListeners('get-product');
        ipcRenderer.removeAllListeners('reply-get-product');
      }else {
        console.log(message);
      }
    });
  }


  render() {
    let {tableBody,tableHeader,productItems} = this.state;
    let options = this.toOptions(this.state.productItems);

    return (
      <div>
        <RestockInputField button={'submit'}
                    parent={'restock'}
                    onSubmitClick={this.handleSubmitClick}
                    otherInfo={{options,productItems}} />
        <div className="table">
        <ShowTable  button={'delete'}
                    onClickAction={this.handleClickAction}
                    tableBody={tableBody}
                    tableHeader={tableHeader}
                    parent={'product'} />
        </div>
        <Button size="sm" onClick={this.handleSubmit}>Submit</Button>
      </div>
    )
  }
}

export default Restock;
