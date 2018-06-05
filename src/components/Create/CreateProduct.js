import React, {Component} from 'react';
import {Button,
        FormGroup,
        FormText,
        Label,
        Input
      } from 'reactstrap';
import PropTypes from 'prop-types';
import ShowTable from '../ShowTable/ShowTable';
import InputField from '../Input/InputField';
import './CreateProduct.css';

class CreateProduct extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleClickAction = this.handleClickAction.bind(this);
    this.toOptions = this.toOptions.bind(this);
    this.state = {
      tableHeader:['Code','Brand', 'Quantity', 'Price','Action'],
      tableBody:[]
    }
  }


  handleSubmit() {
    let{tableBody} = this.state;
    if(tableBody.length > 0) {
      this.props.onSubmit(tableBody,'createProduct');
    }
  }

  toOptions(productItems) {
    return productItems.map((product) => {
      return {value:product.code,label:product.code};
    });
  }


  handleClickAction(idx) {
    // decreasing the value of the tableBody
    this.setState({
      tableBody: this.state.tableBody.filter((obj,i) => i!==idx)
    });
  }

  handleSubmitClick(newItemObj) {
    let {code} = newItemObj;
    let indexFound = this.state.tableBody.findIndex((item) => code.toLowerCase() === item.code.toLowerCase());
    if(indexFound === -1) {
      this.setState({
        tableBody: this.state.tableBody.concat(newItemObj)
      });
    }else {
      // TODO warning for the item is already been created!
    }
  }

  render() {
    let {tableHeader,tableBody} = this.state;
    // console.log(tableBody,'in createProduct');
    let {productItems} = this.props;
    let options = this.toOptions(this.props.productItems);
    return (
      <div className="form-product">
        <InputField button={'submit'}
                    parent={'product'}
                    onSubmitClick={this.handleSubmitClick}
                    otherInfo={{options,productItems}} />
        <div className="table">
          <ShowTable  button={'delete'}
                    onClickAction={this.handleClickAction}
                    tableBody={tableBody}
                    tableHeader={tableHeader}
                    parent={'product'} />
        </div>
        <Button size="sm" color="primary" outline onClick={this.handleSubmit}>Submit</Button>
      </div>
    )
  }
}

CreateProduct.propTypes = {
  productItems:PropTypes.array,
  onSubmit: PropTypes.func
}

export default CreateProduct;
