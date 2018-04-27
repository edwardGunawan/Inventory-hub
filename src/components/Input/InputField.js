import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {
  Button,
  Input,
  Label,
  FormGroup,
  Form
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
    this.clearInput = this.clearInput.bind(this);
    this.inputGroup = this.inputGroup.bind(this);
    // this.creatableSelect = this.creatableSelect.bind(this);
    this.state = {
      otherInfo: this.props.otherInfo,
      selectedOption: '',
      code:'',
      brand:'',
      quantity:0,
      price:0
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
    e.preventDefault();
    console.log(this.state);
    let {code,brand,quantity,price} = this.state;
    let toRet = [{code,brand,quantity,price}];
    console.log(toRet);
    this.props.onSubmitClick({code,brand,quantity,price});
    this.clearInput();
  }


  // hanldeInputChange on select, customer, product
  // on select in customer when customer are typing or adding it will
  // get added to selectedOption
  handleInputChange(evt) {
    console.log(evt.target.name);
    this.setState({
      [evt.target.name] : evt.target.value
    });
  }

  clearInput() {
    this.setState({
      code:'',
      brand:'',
      quantity:0,
      price:0
    });
  }



  inputGroup = () => {
    const {selectedOption,otherInfo,code,brand,price,quantity} = this.state;
    switch(this.props.parent) {
      case 'product':
        const {productItems} = otherInfo;
      // TODO: Adding Button, when user input value, it will
      // autofill the entire field when add enter on the button, it will show
      // in the table
        return (
          <Form inline>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="code">Code</Label>
              <Input name="code" bsSize="sm" value={code} className="mb-2 mr-sm-2 mb-sm-0" onChange={this.handleInputChange} type="text" id="code" placeholder="code"/>
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="brand">Model</Label>
              <Input name="brand" bsSize="sm" value={brand} className="mb-2 mr-sm-2 mb-sm-0" onChange={this.handleInputChange} type="text" id="brand" placeholder="model/brand"/>
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="quantity">Quantity</Label>
              <Input name="quantity" className="mr-sm-2" value={quantity} bsSize="sm" onChange={this.handleInputChange} type="number" step="1" placeholder="quantity"/>
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="price">Price</Label>
              <Input name="price" className="mr-sm-2" value={price} bsSize="sm" onChange={this.handleInputChange} type="number"  placeholder="Price"/>
            </FormGroup>
            <Button onClick={this.handleSubmit}>{this.props.button}</Button>
          </Form>
        )
      case 'customer':
        // const {selectedOption,otherInfo} = this.state;
        // const {otherInfo} = this.props;
        console.log(otherInfo.options);
        console.log(selectedOption);
        return (
          <div>
            <Label for="name">Customer Name</Label>
            <Creatable onChange={this.handleSelectChange} options={otherInfo.options}/>
          </div>
        )
        break;
      case 'action' :
        {/*<Select
          onChange={this.handleChange}
          name="form-field-name"
          options={otherInfo.options}
          /> */}
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
  onSubmitClick: PropTypes.func, // click submit that will be pass as value to parent
  onSelectEnter:PropTypes.func // enter key from select onChange to render to table
}

export default InputField;
