import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import {Form, FormGroup, Label, Input, Button} from 'reactstrap';

class RestockInputField extends Component {
  constructor(props) {
    super(props);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      selectedOption: '',
      code:'',
      brand:'no model',
      quantity:0,
      price:0,
      isDisabled:true,
      otherInfo:{}
    }
  }

  componentDidUpdate(prevProps,prevState) {
    if(prevProps.otherInfo !== this.props.otherInfo) {
      this.setState({
        otherInfo:this.props.otherInfo
      });
    }
  }

  handleSelectChange(selectedOption) {
    if(selectedOption !== null && typeof selectedOption.value !== 'undefined') {
      let {value} = selectedOption;
      let {productItems} = this.state.otherInfo;
      let item = productItems.find((it) => it.code.toLowerCase() === value.toLowerCase());
      if(typeof item !== 'undefined') {
        this.setState({
          code:item.code,
          brand:item.brand,
          price:item.price,
          quantity:item.quantity,
          selectedOption:(value === null) ? '' : value,
          isDisabled: false
        });
      }
    } else {
      this.clearInput();
    }
  }

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

  handleSubmit(e) {
    e.preventDefault();
    let {code,brand,quantity,price, otherInfo} = this.state;
    if(quantity > 0) {
      const toRet = {code,brand,quantity,price};
      this.props.onSubmitClick(toRet);
      this.clearInput();
    }
  }

  render() {
    let {brand,otherInfo,quantity,price} = this.state;
    return (
      <div>
        <FormGroup>
          <Select
              onChange={this.handleSelectChange}
              isClearable
              name="form-field-name"
              options={otherInfo.options}
              />
        </FormGroup>
        <Form inline>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label className="mr-sm-2" for="brand">Model</Label>
            <Input name="brand" bsSize="sm" value={brand} className="mb-2 mr-sm-2 mb-sm-0" onChange={this.handleInputChange} type="text" id="brand" placeholder="model/brand" disabled={true}/>
          </FormGroup>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label className="mr-sm-2" for="quantity">Quantity</Label>
            <Input name="quantity" className="mr-sm-2" value={quantity} bsSize="sm" onChange={this.handleInputChange} type="number" step="1" placeholder="quantity"/>
          </FormGroup>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label className="mr-sm-2" for="price">Price</Label>
            <Input name="price" className="mr-sm-2" value={price} bsSize="sm" onChange={this.handleInputChange} type="number"  placeholder="Price" disabled={true}/>
          </FormGroup>
          <Button size="sm" onClick={this.handleSubmit} disabled={this.state.isDisabled}>{this.props.button}</Button>
        </Form>
      </div>
    )
  }
}

RestockInputField.propTypes = {
  button: PropTypes.string, // name of the button on the submit or add
  parent: PropTypes.string, // parent component that pass the props to this component
  otherInfo: PropTypes.object, // any addition information for search data
  onSubmitClick: PropTypes.func, // click submit that will be pass as value to parent
  onSelectEnter:PropTypes.func // enter key from select onChange to render to table
}



export default RestockInputField;
