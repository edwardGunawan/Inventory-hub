import React, {Component} from 'react';
import Filter from '../Filter/Filter';
import {
   ButtonDropdown,
   DropdownToggle,
   DropdownMenu,
   DropdownItem } from 'reactstrap';
const {ipcRenderer} = window.require('electron');

class TransactionHistory extends Component {
  constructor(props) {
    super(props);
    this.init = this.init.bind(this);
    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.renderDates = this.renderDates.bind(this);
    this.state = {
      orderDates:{},
      customerHistoryDates:{},
      productHistoryDates:{},
      transactionHistory:[], // the transactionHistory that is given
      optionTitle: 'Options',
      dropdownOpen:false
    }
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('transaction-history-init');
    ipcRenderer.removeAllListeners('reply-transaction-history-init');
    ipcRenderer.removeAllListeners('get-transaction');
    ipcRenderer.removeAllListeners('reply-get-transaction');
  }

  init() {
    ipcRenderer.send('transaction-history-init','');
    ipcRenderer.on('reply-transaction-history-init',(event,arg) => {
      let {message,status} = arg;
      if(status === 'OK') {
        // console.log('message in init', message);
        let {orderDates,customerHistoryDates,productHistoryDates} = message;
        this.setState({
          orderDates,
          customerHistoryDates,
          productHistoryDates
        });
      }else {
        console.log(message);
      }
      ipcRenderer.removeAllListeners('transaction-history-init');
      ipcRenderer.removeAllListeners('reply-transaction-history-init');
    });
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    })
  }

  select(evt) {
    this.setState({
      optionTitle: evt.target.innerText
    });
  }

  // TODO:
  // trigger ipcMain getCustomerHistoryDetail, getProductHistoryDetail,
  // getPurchaseDetail
  // dates obj where there is start and end timestamps
  handleChangeDate(category) {
    return (dates) => {
      // console.log('dates in handleChangeDate', dates);
      ipcRenderer.send('get-transaction',{...dates,category});
      ipcRenderer.on('reply-get-transaction',(evt,data) => {
        let {status,message} = data;
        if(status === 'OK') {
          console.log(message);
          this.setState({transactionHistory:message});
        }else {
          console.log(message);
        }
        ipcRenderer.removeAllListeners('get-transaction');
        ipcRenderer.removeAllListeners('reply-get-transaction');
      })
    }
  }

  //TODO:
  // sort product, brand, customer while user get choosing between them
  handleFilter(obj){

  }

  /*
    Render dates to Filter.js based on optionTitle
  */
  renderDates(optionTitle) {
    let dates;
    switch(optionTitle){
      case 'Order':
        dates = this.state.orderDates;
        break;
      case 'Product':
        dates = this.state.productHistoryDates;
        break;
      case 'Customer':
        dates = this.state.customerHistoryDates;
        break;
    }
    return dates;
  }

  render() {
    let {optionTitle,transactionHistory} = this.state;
    let dates = this.renderDates(optionTitle);
    return (
      <div>
        <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
          <DropdownToggle caret>
            {optionTitle}
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Transaction Options</DropdownItem>
            <DropdownItem onClick={this.select}>Order</DropdownItem>
            <DropdownItem onClick={this.select}>Product</DropdownItem>
            <DropdownItem onClick={this.select}>Customer</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        <Filter optionTitle={optionTitle}
                dates={dates}
                onChangeDate={this.handleChangeDate(optionTitle)}
                onFilter={this.handleFilter}
                transactionHistory={transactionHistory}/>
              {/*optionContent*/}
      </div>
    );
  }
}

export default TransactionHistory;
