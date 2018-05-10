import React, {Component} from 'react';
// import InputList from '../Input/InputList';
import InputField from '../Input/InputField';
import PropTypes from 'prop-types';
import ShowTable from '../ShowTable/ShowTable';
import {Button} from 'reactstrap';

// let {ipcRenderer} = window.require('electron');

class CreateCustomer extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelectEnter = this.handleSelectEnter.bind(this);
    this.handleClickAction = this.handleClickAction.bind(this);
    this.toOptions = this.toOptions.bind(this);
    this.state = {
      name:[],
      tableHeader:['name','action']
    }
  }

  // handling submit on here to send value back to create
  handleSubmit(e) {
    // console.log(e);
    e.preventDefault();
    // console.log(this.state.name);
    this.props.onSubmit(this.state.name, 'createCustomer');
  }

  handleSelectEnter(value) {
    let {name} = this.state;
    // console.log(name);
    let obj = {name:value};
    let found = name.find((n) => n.name.toLowerCase() === value.toLowerCase());
    if(typeof found === 'undefined') {
      this.setState({
        name: name.concat(obj)
      });
    }

  }

  handleClickAction(idx) {
    console.log(idx, ' in handleClickAction in customer');
    this.setState({
      name: this.state.name.filter((name,i) => i !== idx)
    });
  }

  toOptions(customerNames) {
    console.log(customerNames);
    return customerNames.map((name) => {
      return {value:name,label:name};
    });
  }


  render() {
    let {customerNames} = this.props;
    let {name,tableHeader} = this.state;
    let options = this.toOptions(customerNames);
    // console.log(customerNames);
    return (
      <div>
        {/*<InputList insideCreate={'customer'}
                   inputField={{name:''}}
                   onSubmitInputList={this.handleSubmitInputList}/> */}
          <InputField
                      button={'Add'}
                      parent={'customer'}
                      onSelectEnter={this.handleSelectEnter}
                      otherInfo={{options}} />
                    {/*name.map((n,i) => <div key={i}>{n.name}</div>)*/}
          <ShowTable button={'Delete'}
                     onClickAction={this.handleClickAction}
                     tableBody={name}
                     tableHeader={tableHeader}
                     parent={'customer'} />
          <Button onClick={this.handleSubmit}>Submit</Button>
      </div>
    )
  }
}

CreateCustomer.propTypes ={
  customerNames: PropTypes.array, // data of the customer names
  onSubmit:PropTypes.func // onSubmit function pass to create.js
}

export default CreateCustomer;
