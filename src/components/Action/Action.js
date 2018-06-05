import React, {Component} from 'react';
import InputField,{selectProductStyle} from '../Input/InputField';
import ShowTable from '../ShowTable/ShowTable';
import PropTypes from 'prop-types';
import {
        Label,
        Input,
        Form,
        FormGroup,
        InputGroup,
        InputGroupAddon,
        InputGroupText,
        Col
} from 'reactstrap';
import Select from 'react-select';
import './Action.css';

class Action extends Component {
  constructor(props) {
    super(props);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleSelectCustomer = this.handleSelectCustomer.bind(this);
    this.handleRadioClick = this.handleRadioClick.bind(this);
    this.handleClickAction = this.handleClickAction.bind(this);
    this.handleDiscountChange = this.handleDiscountChange.bind(this);
    this.toOptions = this.toOptions.bind(this);
    this.state = {
      customerNames: this.props.info.customerNames,
      productItems: this.props.info.productItems,
      discount: this.props.inputField.discount,
      customer:this.props.inputField.customer,
      action:this.props.inputField.action,
      isDisabled: false
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.info.customerNames !== this.props.info.customerNames) {
      this.setState({
        customerNames: this.props.info.customerNames
      });
    } else if (prevProps.info.productItems !== this.props.info.productItems) {
      this.setState({
        productItems: this.props.info.productItems
      });
    } else if (prevProps.inputField !== this.props.inputField) {
      let {discount,customer,action} = this.props.inputField
      this.setState({discount,customer,action});
    }
  }

  handleSubmitClick(order) {
    this.props.onSubmitClick(order);
  }

  handleSelectCustomer(selectedOption) {
    this.props.onSelectCustomer(selectedOption);
  }

  handleDiscountChange(evt) {
    if(evt.target.value <= 100 && evt.target.value >= 0 ) {
      this.props.onDiscountChange(evt);
    }

  }

  handleClickAction(idx) {
    this.props.onClickAction(idx);
  }

  handleRadioClick(evt) {
    this.setState({
      isDisabled: (evt.target.value === 'restock')? true: false
    });
    this.props.onRadioClick(evt);
  }

  // toOptions for select Input
  toOptions(instanceArr) {
    // console.log(instanceArr);
    return instanceArr.map((item) => {
      if(typeof item === 'object') {
        return {
          label: item.code,
          value: item.code
        }
      }else {
        return {
          label:item,
          value:item
        }
      }

    });
  }


  render() {
    let {productItems,customerNames,action} = this.state;
    // console.log(`here in Action ${productItems}, ${tableBody}, ${customerNames}, ${tableHeader}`);
    let productOptions = [], customerOptions = [];
    if(productItems.length > 0) {
      productOptions = this.toOptions(productItems);
    }
    if(customerNames.length > 0) {
      customerOptions = this.toOptions(customerNames);
    }

    return (
      <div>
        <Form inline>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Select
                className="select-customer"
                onChange={this.handleSelectCustomer}
                isClearable
                isDisabled={this.state.isDisabled}
                options={customerOptions}
                styles={selectProductStyle}
                isSearchable={false}
                placeholder="Customer Name"
                />
          </FormGroup>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label for="discount" className="mr-sm-2">Discount</Label>
            <InputGroup>
              <InputGroupAddon addonType="append">
                <Input type="number"
                      id="discount"
                      name="discount"
                      max={100}
                      min={0}
                      onChange={this.handleDiscountChange}
                      value={this.state.discount}
                      bsSize="sm"
                      placeholder="discount"
                      />
                <InputGroupText>%</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
          <FormGroup className="radio-button">
              <Label className="mr-sm-2" check>
                <Input type="radio" onChange={this.handleRadioClick} checked={action === 'sell'} value="sell" name="radio1" />{' '}
                Sell
              </Label>
              <Label className="mr-sm-2" check>
                <Input type="radio" name="radio1" checked={action === 'return'} value="return" onChange={this.handleRadioClick} />{' '}
                Return
              </Label>
          </FormGroup>
        </Form>


      <InputField
        button={'Submit'}
        parent={'action'}
        onSubmitClick={this.handleSubmitClick}
        otherInfo={{options:productOptions,productItems, action:action}}
        />
      <div className="action-table">
        <ShowTable  button={'delete'}
                  onClickAction={this.handleClickAction}
                  tableBody={this.props.tableBody}
                  tableHeader={this.props.tableHeader}
                  parent={'action'} />
      </div>
      </div>
    )
  }
}

Action.defaultProps = {
  customerNames:[],
  productItems:[],
}


Action.propTypes = {
  info: PropTypes.object, // passing customer names, productItems, and toOption for both
  inputField: PropTypes.object, // pass to input component in action
  tableHeader: PropTypes.array, // list of tableHeader
  tableBody: PropTypes.array, // list of tableBody [code,brand,quantity,price,total]
  onSelectCustomer:PropTypes.func, // selecting customer to choose
  onDiscountChange:PropTypes.func, // handling discount change
  onSubmitClick: PropTypes.func, // adding inputField to ShowTable
  onClickAction: PropTypes.func, //delete from TableBody
  onRadioClick: PropTypes.func // onChange radio click sell, return or restock

}

export default Action;
