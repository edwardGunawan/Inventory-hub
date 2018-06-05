import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {
  Button,
  Input,
  Label,
  FormGroup,
  Form
} from 'reactstrap';
import Select from 'react-select';
import Creatable from 'react-select/lib/Creatable';
import numeral from 'numeral';

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
    this.state = {
      otherInfo: this.props.otherInfo,
      selectedOption: '',
      code:'',
      brand:'no model',
      quantity:0,
      price:0,
      isDisabled:true
    }
  }

  componentDidUpdate(prevState,prevProps) {
    if(prevProps.otherInfo !== this.props.otherInfo) {
      this.setState({
        otherInfo:this.props.otherInfo
      });
    }
    if(this.props.parent === 'action' && (prevProps.otherInfo.action !== this.props.otherInfo.action)) {
      this.clearInput();
    }
  }

  // handling Select change
  handleSelectChange = (selectedOption) => {
    // console.log(selectedOption,'in selectedChange ');
    // when selectedOption is null, the value is undefined
    if(selectedOption !== null && typeof selectedOption.value !== 'undefined'){
    let {value} = selectedOption;
    // if it is action and product go through this if statement
      if(this.props.parent === 'action' || this.props.parent === 'product') {
        // console.log(value, ' inside vlaue');
        let {productItems, action } = this.state.otherInfo;
        let item = productItems.find((it) => it.code.toLowerCase() === value.toLowerCase());
        // condition when it is at transaction
        if(typeof item !== 'undefined') {
          this.setState({
            code:item.code,
            brand:item.brand,
            price:item.price,
            quantity:item.quantity,
            selectedOption:(value === null) ? '' : value,
            // if action is not sell then no matter what quantity it will always pass, or else if based on quantity
            isDisabled: ((this.props.parent === 'action') && (action !== 'sell' || item.quantity !== 0)) ? false : true
          });
        } else if(this.props.parent === 'product') {
          // if the value is not created yet, then it will enabled the other options
          this.setState({
            code:value,
            isDisabled:!this.state.isDisabled
          });
        }
      } else if (this.props.parent === 'customer') {
        let item = this.state.otherInfo.options.find((customer) => customer.label.toLowerCase() === value.toLowerCase());
        if(typeof item === 'undefined') {
          this.props.onSelectEnter(value); // pass it back to the parent, no button
        }
      }else if(this.props.parent === 'process-customer') {
        this.props.onSelectEnter(value); // pass it back to the parent, no button
      }
    }
    else {
      this.clearInput();
    }
  }

  // submit button
  handleSubmit = (e) => {
    e.preventDefault();
    // console.log(this.state, 'in handle submit');
    let {code,brand,quantity,price, otherInfo} = this.state;
    if(code && quantity > 0 && price > 0) {
      let toRet;
      if(this.props.parent === 'action') {
        let total = price * quantity;
        toRet = {code,brand,quantity,price,total};
      }else {
        toRet= {code,brand,quantity,price};
      }

      this.props.onSubmitClick(toRet);
      this.clearInput();
    }

  }


  // hanldeInputChange on select, customer, product
  // on select in customer when customer are typing or adding it will
  // get added to selectedOption
  handleInputChange(evt) {
    this.setState({
      [evt.target.name] : evt.target.value
    });
  }

  clearInput() {
    this.setState({
      code:'',
      brand:'no model',
      quantity:0,
      price:0,
      isDisabled:true
    });
  }




  inputGroup = () => {
    const {selectedOption,otherInfo,brand,price,quantity} = this.state;
    switch(this.props.parent) {
      case 'product':
        return (
          <div>
            <Form inline>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Creatable isClearable onChange={this.handleSelectChange} options={otherInfo.options} styles={selectProductStyle} placeholder="Code"/>
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="brand">Model</Label>
                <Input name="brand" bsSize="sm" value={brand} onChange={this.handleInputChange} type="text" id="brand" placeholder="model/brand" disabled={this.state.isDisabled}/>
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="quantity">Quantity</Label>
                <Input name="quantity" value={quantity} bsSize="sm" onChange={this.handleInputChange} type="number" step="1" placeholder="quantity" disabled={this.state.isDisabled}/>
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="price">Price</Label>
                <Input name="price" value={price} bsSize="sm" onChange={this.handleInputChange} type="number"  placeholder="Price" disabled={this.state.isDisabled}/>
              </FormGroup>
              <Button size="sm" onClick={this.handleSubmit} disabled={this.state.isDisabled}>{this.props.button}</Button>
            </Form>
          </div>
        )
      case 'customer':
        return (
          <Creatable isClearable onChange={this.handleSelectChange} options={otherInfo.options} placeholder="name"/>
        )
      case 'process-customer':
        return (
          <Select isClearable onChange={this.handleSelectChange} styles={selectCustomerStyle} options={otherInfo.options} placeholder="name"/>
        )
      default:
        return (
          <div>
            <Form inline>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Select
                    onChange={this.handleSelectChange}
                    isClearable
                    name="form-field-name"
                    options={otherInfo.options}
                    styles={selectProductStyle}
                    placeholder="Code"
                    />
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="brand">Model</Label>
                <Input type="text" bsSize="sm" name="brand" id="brand" value={brand} disabled />
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="quantity">Quantity</Label>
                <Input type="number" bsSize="sm" onChange={this.handleInputChange} name="quantity" id="quantity" disabled={this.state.isDisabled} value={numeral(quantity).format('0,0')}/>
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="price">Price</Label>
                <Input type="text" bsSize="sm" name="price" id="price" value={numeral(price).format('$0,0.00')} disabled />
              </FormGroup>
              <Button  size="sm" onClick={this.handleSubmit} disabled={this.state.isDisabled}>{this.props.button}</Button>
            </Form>
          </div>
        )
    }
  }
  render() {
    return (
      <div>
        {this.inputGroup()}
      </div>

    )
  }
}

export const selectProductStyle = {
  container:(base,state) => ({
    ...base,
    width:'400px',
    marginBottom:'10px'
  })
}

export const selectCustomerStyle ={
  container:(base,state) => ({
    ...base,
    width:'300px'
  })
}

InputField.propTypes = {
  button: PropTypes.string, // name of the button on the submit or add
  parent: PropTypes.string, // parent component that pass the props to this component
  otherInfo: PropTypes.object, // any addition information for search data
  onSubmitClick: PropTypes.func, // click submit that will be pass as value to parent
  onSelectEnter:PropTypes.func // enter key from select onChange to render to table
}

export default InputField;
