import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import {Form, FormGroup, Label, Input, Button} from 'reactstrap';
import {selectProductStyle} from './InputField.js';
import './InputField.css';

class ProductInputField extends Component {
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
      otherInfo:{},
      disable: {brand:true, price:true, quantity:true, submit:true}
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
      let {parent} = this.props;
      let disable = {};
      switch(parent) {
        case 'restock':
          disable={...this.state.disable,submit:false,quantity:false};
          break;
        case 'delete':
          disable={...this.state.disable,submit:false};
          break;
        default:
          disable={brand:false,price:false,quantity:false,submit:false};
      }
      if(typeof item !== 'undefined') {
        this.setState({
          code:item.code,
          brand:item.brand,
          price:item.price,
          quantity:item.quantity,
          selectedOption:(value === null) ? '' : value,
          disable
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
      disable:{brand:true,price:true,quantity:true,submit:true}
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
    let {brand,otherInfo,quantity,price,disable} = this.state;
    let {parent} = this.props;
    return (
      <div>
        <Form>
          <Select
                onChange={this.handleSelectChange}
                isClearable
                name="form-field-name"
                options={otherInfo.options}
                styles={selectProductStyle}
                />
          <div className="form-group-container">
            <FormGroup className="form-group">
              <Label className="mr-sm-2" for="brand">Model</Label>
              <Input name="brand" bsSize="sm" value={brand} onChange={this.handleInputChange} type="text" id="brand" placeholder="model/brand" disabled={disable.brand}/>
            </FormGroup>
            <FormGroup className="form-group">
              <Label className="mr-sm-2" for="quantity">Quantity</Label>
              <Input name="quantity" value={quantity} bsSize="sm" onChange={this.handleInputChange} type="number" step="1" placeholder="quantity" disabled={disable.quantity}/>
            </FormGroup>
            <FormGroup className="form-group">
              <Label className="mr-sm-2" for="price">Price</Label>
              <Input name="price" value={price} bsSize="sm" onChange={this.handleInputChange} type="number"  placeholder="Price" disabled={disable.price}/>
            </FormGroup>
          </div>
          <Button size="sm" outline color="primary" onClick={this.handleSubmit} disabled={disable.submit}>{this.props.button}</Button>
        </Form>
      </div>
    )
  }
}

ProductInputField.propTypes = {
  button: PropTypes.string, // name of the button on the submit or add
  parent: PropTypes.string, // parent component that pass the props to this component
  otherInfo: PropTypes.object, // any addition information for search data
  onSubmitClick: PropTypes.func, // click submit that will be pass as value to parent
  onSelectEnter:PropTypes.func // enter key from select onChange to render to table
}



export default ProductInputField;
