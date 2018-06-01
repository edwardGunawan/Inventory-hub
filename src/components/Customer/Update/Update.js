import React, {Component} from 'react';
import InputField from '../../Input/InputField';
import {Input,Button,Label} from 'reactstrap';
import {history} from '../../Main/Main';
import ShowTable from '../../ShowTable/ShowTable';
import './Update.css';

const {ipcRenderer} = window.require('electron');

class Update extends Component {
  constructor(props) {
    super(props);
    this.handleSelectEnter = this.handleSelectEnter.bind(this);
    this.handleClickAction = this.handleClickAction.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toOptions = this.toOptions.bind(this);
    this.getCustomer = this.getCustomer.bind(this);
    this.state = {
      name:[],
      tableHeader:['From','To','action'],
      customerNames:[],
      nameSelected:'',
      changeName:''
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

  handleSelectEnter = (category) => (value) => {
    switch(category) {
      case 'select':
        this.setState({nameSelected:value})
        break;
      case 'change':
        this.setState({changeName:value.target.value});
        break;
    }

  }

  handleClickAction(idx) {
    this.setState({
      name: this.state.name.filter((name,i) => i !== idx)
    });
  }

  handleSubmit = (category) => (e) => {
    switch(category) {
      case 'submit':
        let {nameSelected,changeName} = this.state;
        if(changeName.length > 0 && nameSelected.length > 0) {
          let obj = {name:nameSelected,change:changeName};
          this.setState({
            name: this.state.name.concat(obj),
            nameSelected:'',
            changeName:''
          });
        }
        break;
      case 'proceed':
        e.preventDefault();
        ipcRenderer.send('update',{input_arr:this.state.name,category:'customer'});
        ipcRenderer.on('reply-update',(evt,data) => {
          let {message,status} = data;
          if(status === 'OK') {
            ipcRenderer.removeAllListeners('update');
            ipcRenderer.removeAllListeners('reply-update');
            history.push('/Update');
          }else {
            //TODO some modal that it doesn't work
          }
        });
        break;
    }

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
    let {tableHeader,name,customerNames,changeName} = this.state;
    let options = this.toOptions(customerNames);
    return(
      <div>
        <InputField
                  button={'Add'}
                  parent={'process-customer'}
                  onSelectEnter={this.handleSelectEnter('select')}
                  otherInfo={{options}} />
        <Label>Change To: </Label>
        <Input placeholder="name" type="text" value={changeName} onChange={this.handleSelectEnter('change')} />
        <Button size="sm" onClick={this.handleSubmit('submit')}  disabled={this.state.changeName.length <= 0}>Submit </Button>
        <div className="table-update">
          <ShowTable button={'Delete'}
                     onClickAction={this.handleClickAction}
                     tableBody={name}
                     tableHeader={tableHeader}
                     parent={'process-customer'} />
        </div>
        <Button size="sm" onClick={this.handleSubmit('proceed')}>Proceed</Button>
      </div>
    )
  }
}

export default Update;
