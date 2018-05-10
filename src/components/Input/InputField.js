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
// import 'react-select/dist/react-select.css';

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
      brand:'no model',
      quantity:0,
      price:0
    }
  }

  componentDidUpdate(prevState,prevProps) {
    if(prevProps.otherInfo !== this.props.otherInfo) {
      this.setState({otherInfo:this.props.otherInfo});
    }
  }

  // handling Select change
  handleSelectChange = (selectedOption) => {
    // console.log(value,'in selectedChange ');
    // when selectedOption is null, the value is undefined
    if(selectedOption !== null && typeof selectedOption.value !== 'undefined'){
    let {value} = selectedOption;
    // if it is actio and product go through this iff statement
      if(this.props.parent === 'action' || this.props.parent === 'product') {
        console.log(value, ' inside vlaue');
        let item = this.state.otherInfo.productItems.find((it) => it.code.toLowerCase() === value.toLowerCase());
        console.log(item);
        if(this.props.parent === 'action' && typeof item !== 'undefined') {
          this.setState({
            code:item.code,
            brand:item.brand,
            price:item.price,
            quantity:item.quantity,
            selectedOption:(value === null) ? '' : value
          });
        } else if(this.props.parent === 'product') {
          // if it is created then set that as the state
          this.setState({
            code:value
          });
        }
      } else if (this.props.parent === 'customer') {
        let item = this.state.otherInfo.options.find((customer) => customer.name.toLowerCase() === value.toLowerCase());
        if(typeof item === 'undefined') {
          this.props.onSelectEnter(value); // pass it back to the parent, no button
        }

      }
    }
    else {
      this.clearInput();
    }
  }

  // submit button
  handleSubmit = (e) => {
    e.preventDefault();
    console.log(this.state, 'in handle submit');
    let {code,brand,quantity,price} = this.state;
    if(code && quantity > 0 && price > 0) {
      let total = price * quantity;
      let toRet = {code,brand,quantity,price,total};
      this.props.onSubmitClick(toRet);
      this.clearInput();
    }

  }


  // hanldeInputChange on select, customer, product
  // on select in customer when customer are typing or adding it will
  // get added to selectedOption
  handleInputChange(evt) {
    // console.log(evt.target.name);
    this.setState({
      [evt.target.name] : evt.target.value
    });
  }

  clearInput() {
    this.setState({
      code:'',
      brand:'no model',
      quantity:0,
      price:0
    });
  }



  inputGroup = () => {
    const {selectedOption,otherInfo,brand,price,quantity} = this.state;
    switch(this.props.parent) {
      case 'product':
        // const {productItems} = otherInfo;
        return (
          <div>
            <FormGroup>
              <Label for="code">Code</Label>
              {/*<Input name="code" bsSize="sm" value={code} className="mb-2 mr-sm-2 mb-sm-0" onChange={this.handleInputChange} type="text" id="code" placeholder="code"/> */}
              <Creatable isClearable onChange={this.handleSelectChange} options={otherInfo.options}/>
            </FormGroup>
            <Form inline>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="brand">Model</Label>
                <Input name="brand" bsSize="sm" value={brand} className="mb-2 mr-sm-2 mb-sm-0" onChange={this.handleInputChange} type="text" id="brand" placeholder="model/brand"/>
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="quantity">Quantity</Label>
                <Input name="quantity" className="mr-sm-2" value={quantity} bsSize="sm" onChange={this.handleInputChange} type="number" step="1" placeholder="quantity"/>
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="price">Price</Label>
                <Input name="price" className="mr-sm-2" value={price} bsSize="sm" onChange={this.handleInputChange} type="number"  placeholder="Price"/>
              </FormGroup>
              <Button size="sm" onClick={this.handleSubmit}>{this.props.button}</Button>
            </Form>

          </div>
        )
      case 'customer':
        // const {selectedOption,otherInfo} = this.state;
        // const {otherInfo} = this.props;
        console.log(otherInfo.options);
        console.log(selectedOption);
        return (
          <div>
            <Label for="name">Customer Name</Label>
            <Creatable isClearable onChange={this.handleSelectChange} options={otherInfo.options}/>
          </div>
        )
      // case 'action' :
      default:
        return (
          <div>
            <FormGroup style={{'width':'100%'}}>
              <Label for="code"> Code </Label>
              <Select
                  onChange={this.handleSelectChange}
                  isClearable
                  name="form-field-name"
                  options={otherInfo.options}
                  />
            </FormGroup>
            <Form inline>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="quantity">Quantity</Label>
                <Input type="number" className="mr-sm-2" bsSize="sm" onChange={this.handleInputChange} name="quantity" id="quantity" value={numeral(quantity).format('0,0')}/>
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="brand">Model</Label>
                <Input type="text" className="mr-sm-2" bsSize="sm" name="brand" id="brand" value={brand} disabled />
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label className="mr-sm-2" for="price">Price</Label>
                <Input type="text" className="mr-sm-2" bsSize="sm" name="price" id="price" value={numeral(price).format('$0,0.00')} disabled />
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Button  size="sm" className="mr-sm-2" onClick={this.handleSubmit}>{this.props.button}</Button>
              </FormGroup>
            </Form>
          </div>
        )
    }
  }
  render() {
    // const {button} = this.props;

    return (
      <div>
        {this.inputGroup()}
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
