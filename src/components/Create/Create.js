import React, {Component} from 'react';
import CreateProduct from './CreateProduct';
import CreateCustomer from './CreateCustomer';
import { ButtonDropdown,
        DropdownToggle,
        DropdownMenu,
        DropdownItem } from 'reactstrap';

let {ipcRenderer} = window.require('electron');

class Create extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getProduct = this.getProduct.bind(this);
    this.getCustomer = this.getCustomer.bind(this);
    this.fetch = this.fetch.bind(this);
    this.state = {
      dropdownOpen: false,
      content:'What do you want to create?', // content for dropdownToggle
      value:'',
      productItems:[],
      customerNames:[]
    }
  }

  componentDidMount() {
    this.getProduct();
    this.getCustomer();
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('get-product');
    ipcRenderer.removeAllListeners('reply-get-product');
    ipcRenderer.removeAllListeners('get-customer');
    ipcRenderer.removeAllListeners('reply-get-customer');
    ipcRenderer.removeAllListeners('create-customer');
    ipcRenderer.removeAllListeners('reply-create-customer');
    ipcRenderer.removeAllListeners('create-product');
    ipcRenderer.removeAllListeners('reply-create-product');
  }

  // fetch product
  getProduct() {
    ipcRenderer.send('get-product','');
    ipcRenderer.on('reply-get-product', (event,arg) => {
      let {message,status} = arg;
      if(status === 'OK') {
        this.setState({productItems : message});
      }else {
        console.log(message);
      }
    });
  }

  // fetch customer
  getCustomer() {
    ipcRenderer.send('get-customer', '');
    ipcRenderer.on('reply-get-customer', (event,arg) => {
      let {message,status} = arg;
      if(status === 'OK') {
        this.setState({customerNames: message});
      }else {
        console.log(message);
      }
    });
  }

  fetch(channel,dataToSend) {
    ipcRenderer.send(`${channel}`,{input_arr:dataToSend});
    ipcRenderer.on(`reply-${channel}`, (event,arg)=>{
      let {status,message} = arg;
      if(status === 'OK') {
        this.props.history.replace('/InOut'); // reroute to search
      }else {
        console.log(message);
      }
    });
  }

  handleSubmit(inputList, child) {
    if(child === 'createCustomer') {
      this.fetch('create-customer',inputList);
    }else if(child === 'createProduct') {
      console.log('here in handleSubmit input list');
      this.fetch('create-product',inputList);
    } else {
      this.fetch('restock',inputList);
    }
  }

  toggle() {
    // console.log('here in toggle');
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }



  select(e) {
    let selected = e.target.innerText;
    let {productItems, customerNames} = this.state;
    this.setState({
      content: selected,
      value: (selected === 'Create Product') ?
       <CreateProduct onSubmit={this.handleSubmit}
        productItems={productItems}/> :
        <CreateCustomer onSubmit={this.handleSubmit}
          customerNames={customerNames}/>
    });

  }




  render() {
    let {content,value} = this.state;
    return (
      <div>
        <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
          <DropdownToggle caret>
            {content}
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={this.select}>
              Create Product
            </DropdownItem>
            <DropdownItem onClick={this.select}>
              Create Customer
            </DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        {value}
      </div>

    )
  }
}

export default Create;
