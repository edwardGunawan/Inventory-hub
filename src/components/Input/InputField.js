import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {
  Button,
  Input,
  Label
} from 'reactstrap';
import Select, {Creatable} from 'react-select';
import 'react-select/dist/react-select.css';

/*
  All the InputField Component that is in the application
  Create Component, CreateProduct Component, Transaction input field
  Include select react

  Props:
  button
  inputList : input attribute and types of input content array
  parent: which parent componenet it is coming from
*/
class InputField extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.inputGroup = this.inputGroup.bind(this);
    // this.creatableSelect = this.creatableSelect.bind(this);
    this.state = {
      otherInfo: this.props.otherInfo,
      selectedOption: '',
    }
  }

  // handling Select change
  handleSelectChange = (selectedOption) => {
    // console.log(selectedOption);
    let {value, label} = selectedOption;
    if(value !== null){
      this.props.onSelectEnter(value); // pass it back to the parent
    }

    // console.log('selectedOption', selectedOption);
  }

  // submit button
  handleSubmit = (e) => {
    console.log(e.target);
  }

  // hanldeInputChange on select, customer, product
  // on select in customer when customer are typing or adding it will
  // get added to selectedOption
  handleInputChange(e) {
    console.log(e.target.value);
    this.refs.hidden.val = e.target.value;
    console.log(this.refs.hidden.val);
    // this.setState({selectedOption:e.target.value});
  }



  inputGroup = () => {
    switch(this.props.parent) {
      case 'product':
      console.log('go through customer');
        return (
          <div>
            <Label for="code">Code</Label>
            <Input name="code" type="text" id="code" placeholder="code"/>
            <Label for="brand">Model</Label>
            <Input name="brand" type="text" id="brand" placeholder="model/brand"/>
            <Label for="quantity">Quantity</Label>
            <Input name="quantity" type="number" step="1" placeholder="quantity" />
            <Label for="price">Price</Label>
            <Input name="price" type="number" placeholder="Price"/>
          </div>
        )
      case 'customer':
        const {selectedOption,otherInfo} = this.state;
        // const {otherInfo} = this.props;
        console.log(otherInfo.options);
        console.log(selectedOption);
        return (
          <div>
            <Label for="name">Customer Name</Label>
            {/*<Select
              onChange={this.handleChange}
              name="form-field-name"
              options={otherInfo.options}
              /> */}
            <Creatable onChange={this.handleSelectChange} options={otherInfo.options}/>
          </div>
        )
        break;
      case 'action' :
        break;
    }
  }
  render() {
    const {button} = this.props;

    return (
      <div>
        {this.inputGroup()}
        {this.state.selectedOption}
        {/*<Button onClick={this.handleClick}>{button}</Button>*/}
      </div>

    )
  }
}

InputField.propTypes = {
  button: PropTypes.string, // name of the button on the submit or add
  parent: PropTypes.string, // parent component that pass the props to this component
  otherInfo: PropTypes.object, // any addition information for search data
  // onSubmitClick: PropTypes.func, // click submit that will be pass as value to parent
  onSelectEnter:PropTypes.func // enter key from select onChange to render to table
}

export default InputField;
