import React, {Component} from 'react';
import InputField from '../Input/InputField';
import ShowTable from '../ShowTable/ShowTable';
import PropTypes from 'prop-types';
import {Button,
        Label,
        Input,
        Form,
        FormGroup
} from 'reactstrap';
import Select from 'react-select';

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
      selected:this.props.inputField.selected,
      discount: this.props.inputField.discount,
      customer:this.props.inputField.customer,
      action:this.props.inputField.action
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
      let {discount,selected,customer,action} = this.props.inputField
      this.setState({discount,selected,customer,action});
    }
  }

  handleSubmitClick(order) {
    this.props.onSubmitClick(order);
  }

  handleSelectCustomer(selectedOption) {
    this.props.onSelectCustomer(selectedOption);
  }

  handleDiscountChange(evt) {
    this.props.onDiscountChange(evt);
  }

  handleClickAction(idx) {
    this.props.onClickAction(idx);
  }

  handleRadioClick(evt) {
    this.props.onRadioClick(evt);
  }

  // toOptions for select Input
  toOptions(instanceArr) {
    console.log(instanceArr);
    return instanceArr.map((item) => {
      if(typeof item === 'object') {
        return {
          label: item.code,
          value: item.code
        }
      }else {
        console.log('item in customer', item);
        return {
          label:item,
          value:item
        }
      }

    });
  }


  render() {
    let {productItems,tableBody,customerNames,tableHeader,action} = this.state;
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
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0 form-group">
            <Label className="mr-sm-2">Customer</Label>
            <Select
                className="select-customer"
                onChange={this.handleSelectCustomer}
                isClearable
                name="form-field-name"
                options={customerOptions}
                isSearchable={false}
                />
          </FormGroup>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label className="mr-sm-2" for="discount">Discount</Label>
            <Input type="number" id="discount" name="discount" onChange={this.handleDiscountChange} value={this.state.discount} bsSize="sm" placeholder="discount"/>
          </FormGroup>
          <FormGroup check>
            <Label check>
              <Input type="radio" onClick={this.handleRadioClick} checked={action === 'sold'} value="sold" name="radio1" />{' '}
              Sold
            </Label>
          </FormGroup>
          <FormGroup check>
            <Label check>
              <Input type="radio" name="radio1" value="return" checked={action === 'return'} onClick={this.handleRadioClick} />{' '}
              Return
            </Label>
          </FormGroup>
        </Form>

      <InputField
        button={'Submit'}
        parent={'action'}
        onSubmitClick={this.handleSubmitClick}
        otherInfo={{options:productOptions,productItems}}
        />
      <div className="show-table-container">
        <ShowTable  button={'delete'}
                  className="show-table"
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
  inputField: PropTypes.object,
  tableHeader: PropTypes.array, // list of tableHeader
  tableBody: PropTypes.array, // list of tableBody
  onSelectCustomer:PropTypes.func, // selecting customer to choose
  onDiscountChange:PropTypes.func, // handling discount change
  onSubmitClick: PropTypes.func, // adding inputField to ShowTable
  onClickAction: PropTypes.func, //delete from TableBody
  onRadioClick: PropTypes.func // onChange radio click sold or return

}

export default Action;
