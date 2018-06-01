import React, {Component} from 'react';
import {history} from '../../Main/Main';
import {Button} from 'reactstrap';
import Select from 'react-select';
import ShowTable from '../../ShowTable/ShowTable';
import InputField from '../../Input/InputField';
import './Delete.css';

const {ipcRenderer} = window.require('electron');

class Delete extends Component {
  constructor(props) {
    super(props);
    this.handleSelectEnter = this.handleSelectEnter.bind(this);
    this.handleClickAction = this.handleClickAction.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toOptions = this.toOptions.bind(this);
    this.getCustomer = this.getCustomer.bind(this);
    this.state = {
      name:[],
      tableHeader:['name','action'],
      customerNames:[]
    }
  }
  componentDidMount() {
    this.getCustomer();
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('get-customer');
    ipcRenderer.removeAllListeners('reply-get-customer');
    ipcRenderer.removeAllListeners('delete');
    ipcRenderer.removeAllListeners('reply-delete');
  }


  // handling submit on here to send value back to create
  handleSubmit(e) {
    e.preventDefault();
    ipcRenderer.send('delete',{input_arr:this.state.name,category:'customer'});
    ipcRenderer.on('reply-delete',(evt,data) => {
      let {message,status} = data;
      if(status === 'OK') {
        ipcRenderer.removeAllListeners('delete');
        ipcRenderer.removeAllListeners('reply-delete');
        history.push('/Delete');
      }else {
        //TODO some modal that it doesn't work
      }
    });
  }

  handleSelectEnter(value) {
    let {name} = this.state;
    let obj = {name:value};
    let found = name.find((n) => n.name.toLowerCase() === value.toLowerCase());
    if(typeof found === 'undefined') {
      this.setState({
        name: name.concat(obj)
      });
    }

  }

  handleClickAction(idx) {
    this.setState({
      name: this.state.name.filter((name,i) => i !== idx)
    });
  }

  toOptions(customerNames) {
    return customerNames.map((name) => {
      return {value:name,label:name};
    });
  }

  getCustomer() {
    ipcRenderer.send('get-customer', '');
    ipcRenderer.on('reply-get-customer', (event,arg) => {
      let {message,status} = arg;
      if(status === 'OK') {
        this.setState({customerNames: message});
        ipcRenderer.removeAllListeners('get-customer');
        ipcRenderer.removeAllListeners('reply-get-customer');
      }else {
        console.log(message);
      }
    });
  }


  render() {
    let {name,tableHeader,customerNames} = this.state;
    let options = this.toOptions(customerNames);
    return (
      <div>
          <InputField
                      button={'Add'}
                      parent={'process-customer'}
                      onSelectEnter={this.handleSelectEnter}
                      otherInfo={{options}} />
                    <div class="table-delete">
            <ShowTable button={'Delete'}
                     onClickAction={this.handleClickAction}
                     tableBody={name}
                     tableHeader={tableHeader}
                     parent={'customer'} />
         </div>
                   <Button size="sm" onClick={this.handleSubmit}>Submit</Button>
      </div>
    )
  }
}

export default Delete;
