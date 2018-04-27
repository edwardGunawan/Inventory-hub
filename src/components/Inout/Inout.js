import React, {Component} from 'react';
import InputList from '../Input/InputList';
import InputField from '../Input/InputField';
import ShowTable from '../ShowTable/ShowTable';
import InvoiceConverter from '../InvoiceConverter/InvoiceConverter';
import {Button,
        Label,
        Input,
        Form,
        FormGroup
} from 'reactstrap';
import Select from 'react-select';
import './Inout.css';
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
    this.getProduct = this.getProduct.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleSelectCustomer = this.handleSelectCustomer.bind(this);
    this.handleRadioClick = this.handleRadioClick.bind(this);
    this.handleClickAction = this.handleClickAction.bind(this);
    this.handleDiscountChange = this.handleDiscountChange.bind(this);
    this.toOptions = this.toOptions.bind(this);
    this.state = {
      customerNames: [],
      productItems:[],
      selected:'',
      discount: 0,
      tableBody:[],
      tableHeader:['Code','Quantity','Brand','Price','Action'],
      customer:'',
      action:''
    }
  }

  componentDidMount() {
    this.getCustomer();
    this.getProduct();
    // ipcRenderer.send('get-customer');
    // ipcRenderer.on('reply-get-customer', (event, arg) => {
    //   let {message,status} = arg;
    //   console.log('get through here in reply-get-customer');
    //   console.log(message);
    //   if (status === 'OK') {
    //     this.setState({
    //       customerNames:message
    //     })
    //   }else {
    //     console.log(message);
    //   }
    // });
  }

  componentWillUnmount(){
    ipcRenderer.removeAllListeners('get-customer');
    ipcRenderer.removeAllListeners('reply-get-customer');
    ipcRenderer.removeAllListeners('get-product');
    ipcRenderer.removeAllListeners('reply-get-product');
  }


  handleSubmitInputList = () => {
    let {customer,discount,tablebody} = this.state
    console.log(this.state,' in inout submitInputList');
  }

  handleSubmitClick(order) {
    console.log(order,'in handleSubmit');
    let found = this.state.tableBody.find((val) => val.code === order.code);
    console.log(found, 'found');
    // ifonlyif found is undefined, that means it is already in the table
    if(typeof found === 'undefined') {
      this.setState({
        tableBody:this.state.tableBody.concat(order)
      });
    }
  }

  handleSelectCustomer(selectedOption) {
    if(selectedOption !== null && typeof selectedOption.value !== undefined) {
      this.setState({customer:selectedOption.value});
    }
  }

  handleDiscountChange(evt) {
    this.setState({discount:evt.target.value});
  }

  handleClickAction(idx) {
    this.setState({
      tableBody: this.state.tableBody.filter((item,i) => i !== idx)
    });
  }

  handleRadioClick(evt) {
    console.log(evt.target.value, ' in radioClick');
    this.setState({action:evt.target.value});
  }

  // toOptions for select Input
  toOptions(instanceArr) {
    return instanceArr.map((item) => {
      console.log(typeof item.code, ' in item');
      if(typeof item === 'object') {
        return {
          label: item.code,
          value: item.code
        }
      }else {
        console.log('item in customer', item);
        return {
          label:item,
          value:item
        }
      }

    });
  }

  getProduct = () => {
    ipcRenderer.send('get-product');
    ipcRenderer.on('reply-get-product', (evt,arg) => {
      let {message,status} = arg;
      console.log('get through here in reply-get-product');
      if(status==='OK') {
        this.setState({
          productItems:message
        });
      }else {
        console.log(message);
      }
    });
  }

  getCustomer = () => {
    ipcRenderer.send('get-customer');
    ipcRenderer.on('reply-get-customer', (event, arg) => {
      let {message,status} = arg;
      console.log('get through here in reply-get-customer');
      if (status === 'OK') {
        this.setState({
          customerNames:message
        })
      }else {
        console.log(message);
      }
    });
  }

  render() {
    let {productItems,tableBody,customerNames,tableHeader} = this.state;
    console.log(productItems,'productItems in render in Inout');
    console.log(tableBody);
    console.log(customerNames);
    let options = this.toOptions(productItems);
    let customerOptions = this.toOptions(customerNames);
    console.log(options, 'options here in render');
    return (
      <div>
        {/*}<InputList
          inputField={{code:'',quantity:0}}
          insideCreate={'inout'}
          onSubmitInputList={this.handleSubmitInputList}
          customerNames={this.state.customerNames}
          /> */}
          <Form inline>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0 form-group">
              <Label className="mr-sm-2">Customer</Label>
              <Select
                  className="select-customer"
                  onChange={this.handleSelectCustomer}
                  isClearable
                  name="form-field-name"
                  options={customerOptions}
                  isSearchable={false}
                  />
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label className="mr-sm-2" for="discount">Discount</Label>
              <Input type="number" id="discount" name="discount" onChange={this.handleDiscountChange} value={this.state.discount} bsSize="sm" placeholder="discount"/>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input type="radio" onClick={this.handleRadioClick} value="sold" name="radio1" />{' '}
                Sold
              </Label>
            </FormGroup>
            <FormGroup check >
              <Label check>
                <Input type="radio" name="radio1" value="return" onClick={this.handleRadioClick} />{' '}
                Return
              </Label>
            </FormGroup>
          </Form>

        <InputField
          button={'Submit'}
          parent={'action'}
          onSubmitClick={this.handleSubmitClick}
          otherInfo={{options,productItems}}
          />
        <div className="show-table-container">
          <ShowTable  button={'delete'}
                    className="show-table"
                    onClickAction={this.handleClickAction}
                    tableBody={tableBody}
                    tableHeader={tableHeader}
                    parent={'action'} />
        </div>
          <Button onClick={this.handleSubmitInputList} size="sm">Proceed</Button>
      </div>
    )
  }
}


export default Inout;
