import React, {Component} from 'react';
import ShowTable from '../ShowTable/ShowTable';
import InputField from '../Input/InputField';
import ProductInputField from '../Input/ProductInputField';
import {Button} from 'reactstrap';
import {history} from '../Main/Main';

const {ipcRenderer} = window.require('electron');

const ProductClass = ({parent}) => (onSubmit) => {
  return class Product extends Component {
    constructor(props) {
      super(props);
      this.handleSubmitClick = this.handleSubmitClick.bind(this);
      this.handleClickAction = this.handleClickAction.bind(this);
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
          <ProductInputField button={'submit'}
                      parent={parent}
                      onSubmitClick={this.handleSubmitClick}
                      otherInfo={{options,productItems}} />
          <div className="table">
          <ShowTable  button={'delete'}
                      onClickAction={this.handleClickAction}
                      tableBody={tableBody}
                      tableHeader={tableHeader}
                      parent={'product'} />
          </div>
          <Button size="sm" onClick={() => onSubmit(tableBody)}>Submit</Button>
        </div>
      )
    }
  }
}

/**
  * HOC for getting handleSubmit function to work in product
*/
const handleSubmit = (process,reRoute) => (tableBody) => {
  if(tableBody.length > 0) {
    ipcRenderer.send(`${process}`,{input_arr:tableBody,category:'product'});
    ipcRenderer.on(`reply-${process}`,(evt,data) => {
      let {status,message} = data;
      if(status === 'OK') {
        ipcRenderer.removeAllListeners(`${process}`);
        ipcRenderer.removeAllListeners(`reply-${process}`);
        history.push(`/${reRoute}`);
      }else {
        // TODO
        // get some message for error
        console.log(message);
      }
    });
  }
}

const Product = (process,reRoute) => ProductClass({parent:process})(handleSubmit(process,reRoute));

export default Product;
