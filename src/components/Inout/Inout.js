import React, {Component} from 'react';
import InvoiceConverter from '../InvoiceConverter/InvoiceConverter';
import Action from '../Action/Action';
import { Button } from 'reactstrap';
import './Inout.css';
import numeral from 'numeral';
import {history} from '../Main/Main';
let {ipcRenderer} = window.require('electron');
/*
  Buy/Sell Component:
    All math calculation and discount will be in frontend
    backend is handling in and out on the transaction model
*/
class Inout extends Component {
  constructor(props){
    super(props);
    this.handleProceed = this.handleProceed.bind(this);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.getCustomer = this.getCustomer.bind(this);
    this.getProduct = this.getProduct.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleSelectCustomer = this.handleSelectCustomer.bind(this);
    this.handleRadioClick = this.handleRadioClick.bind(this);
    this.handleClickAction = this.handleClickAction.bind(this);
    this.handleDiscountChange = this.handleDiscountChange.bind(this);
    this.convertToPdf = this.convertToPdf.bind(this);
    this.purchase = this.purchase.bind(this);
    this.state = {
      customerNames: [],
      productItems:[],
      discount: 0,
      tableBody:[],
      tableHeader:['Code','Brand','Quantity','Price','Total','Action'],
      customer:'',
      action:'sell',
      currWindow:'action', // use this to change the proceed button to go to invoiceConverter
      proceed:'Proceed',
      back:true,
      totalWithoutDiscount:0,
      total:0,
      doc:''
    }
  }

  componentDidMount() {
    this.getCustomer();
    this.getProduct();
  }

  componentWillUnmount(){

    ipcRenderer.removeAllListeners('get-customer');
    ipcRenderer.removeAllListeners('reply-get-customer');
    ipcRenderer.removeAllListeners('get-product');
    ipcRenderer.removeAllListeners('reply-get-product');
    // don't forget to removeAllListeners to avoid memory leak
    // re-triggered the purchase a few times and print duplicate invoice
    ipcRenderer.removeAllListeners('reply-purchase');
    ipcRenderer.removeAllListeners('purchase');
    ipcRenderer.removeAllListeners('convert-pdf');
    ipcRenderer.removeAllListeners('reply-convert-pdf')
  }


  handleProceed = () => {
    let {currWindow} = this.state
    if(currWindow === 'action') {
      let {customer,total,action} = this.state;
      console.log(action, 'in state');
      // don't go next if the total is not zero and they didn't choose customer
      if(total !== 0 && (customer.length > 0 || action === 'restock')) {
        this.setState({
          currWindow:'invoiceConverter',
          proceed:'Confirm Invoice',
          back:false
        });
      }

    } else if(currWindow === 'invoiceConverter') {
      // print invoice converter
      // console.log('triggered invoice converter');
      let {tableBody,customer,discount,action,total} = this.state;
      this.purchase(tableBody,customer,discount,action,total);
    }

    // console.log(this.state,' in inout submitInputList');
  }

  purchase(tableBody,customer,discount,action,total) {
    ipcRenderer.send('purchase', {productArr:tableBody,customer,discount,action,totalPrice:total});
    ipcRenderer.on('reply-purchase', (evt,arg) => {
      let {message, status} = arg;
      if(status === 'OK') {
        this.convertToPdf(tableBody,discount,customer,action,total); // convert here to pdf
      } else {
        console.log(message);
      }
    });
  }

  convertToPdf(tableBody,discount,customer,action,total) {
    let items = tableBody.map((body) => {
      // console.log(body);
      return {
        price:body.price,
        code:body.code,
        quantity:numeral(body.quantity).format('0,0'),
        brand:body.brand,
        total:numeral(body.total).format('0,0.0')
      }
    });

    ipcRenderer.send('convert-pdf', {items,discount,customer,action,total});
    ipcRenderer.on('reply-convert-pdf', (evt,args) => {
      let {status} = args;
      if(status === 'OK') {
        history.push('/');
      }
    })
  }

  handleBackButton = () => {
    this.setState({
      // try not to mutate the array by returning the shallow copy of it
      currWindow:'action',
      proceed:'Proceed',
      customer:'',
      back: true
    });
  }

  handleSubmitClick(order) {
    // console.log(order,'in handleSubmit');
    let found = this.state.tableBody.find((val) => val.code === order.code);
    // console.log(found, 'found');
    // ifonlyif found is undefined, that means it is already in the table
    if(typeof found === 'undefined') {
      this.setState({
        tableBody:this.state.tableBody.concat(order),
        totalWithoutDiscount: this.state.totalWithoutDiscount+order.total,
        total:(this.state.totalWithoutDiscount + order.total) * (1-(this.state.discount/100))
      });
    }else {
      // TODO warning for custoemr already in buffer
    }
  }

  handleSelectCustomer(selectedOption) {
    if(selectedOption !== null && typeof selectedOption.value !== undefined) {
      this.setState({customer:selectedOption.value});
    }
  }

  handleDiscountChange(evt) {
    // console.log(`Get through here in Inout for handleDiscountChange ${evt}`);
    this.setState({
      discount:evt.target.value,
      total: this.state.totalWithoutDiscount * (1-(evt.target.value/100))
    });
  }

  handleClickAction(idx) {
    this.setState({
      tableBody: this.state.tableBody.filter((item,i) => i !== idx),
      totalWithoutDiscount: this.state.totalWithoutDiscount - this.state.tableBody[idx].total,
      total: (this.state.totalWithoutDiscount -this.state.tableBody[idx].total) * (1-(this.state.discount/100)),
    });
  }

  handleRadioClick(evt) {
    // console.log(evt.target.value, ' in radioClick');
    this.setState({action:evt.target.value, customer:(evt.target.value === 'restock')? '' : this.state.customer});
  }


  getProduct = () => {
    ipcRenderer.send('get-product');
    ipcRenderer.on('reply-get-product', (evt,arg) => {
      let {message,status} = arg;
      // console.log('get through here in reply-get-product');
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
      // console.log('get through here in reply-get-customer');
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
    let {customerNames,
      productItems,
      tableHeader,
      tableBody,
      discount,
      customer,
      action,
      currWindow,
      proceed,
      back,
      totalWithoutDiscount,
      total} = this.state;
    // console.log(`In Inout ${customerNames}, ${productItems}, ${tableHeader}`);
    return (
      <div>
        {(currWindow === 'action') ? <Action info={{customerNames, productItems}}
          tableHeader={tableHeader}
          tableBody={tableBody}
          inputField={{discount,customer,action}}
          onSubmitClick={this.handleSubmitClick}
          onSelectCustomer={this.handleSelectCustomer}
          onDiscountChange={this.handleDiscountChange}
          onClickAction={this.handleClickAction}
          onRadioClick={this.handleRadioClick}
          /> : <InvoiceConverter
                  info={{tableBody,customer,discount,action,total}}
                  />}
        <div className="total-box">
          <h6>Total: {totalWithoutDiscount} in  <span className="text-success">{discount}%</span> = {numeral(total).format('$0,0.00')}</h6>
        </div>

        <Button onClick={this.handleBackButton} size="sm" disabled={back}>Back</Button>
        <Button onClick={this.handleProceed} size="sm">{proceed}</Button>

      </div>
    )
  }
}


export default Inout;
