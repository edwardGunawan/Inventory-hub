import React, {Component} from 'react';
import {Button,
        FormGroup,
        FormText,
        Label,
        Input,
        ButtonDropdown,
        DropdownToggle,
        DropdownMenu,
        DropdownItem
      } from 'reactstrap';
import PropTypes from 'prop-types';
// import InputList from '../Input/InputList';
import ShowTable from '../ShowTable/ShowTable';
import InputField from '../Input/InputField';
import './CreateProduct.css';

class CreateProduct extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    // this.handleSelectEnter = this.handleSelectEnter.bind(this);
    this.handleClickAction = this.handleClickAction.bind(this);
    this.toOptions = this.toOptions.bind(this);
    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    this.state = {
      tableHeader:['Code','Brand', 'Quantity', 'Price','Action'],
      tableBody:[],
      action: 'New',
      dropdownOpen: false
    }
  }


  handleSubmit() {
    let{tableBody} = this.state;
    // tableBody.forEach((inputObj) => {
    //   console.log(inputObj);
    // });
    if(this.state.action === 'New') {
      this.props.onSubmit(tableBody,'createProduct');
    } else {
      this.props.onSubmit(tableBody,'restock')
    }

  }

  toOptions(productItems) {
    // console.log(productItems);
    return productItems.map((product) => {
      return {value:product.code,label:product.code};
    });
  }


  handleClickAction(idx) {
    // console.log(idx);
    // decreasing the value of the tableBody
    this.setState({
      tableBody: this.state.tableBody.filter((obj,i) => i!==idx)
    });
  }

  handleSubmitClick(newItemObj) {
    // console.log(this.state.tableBody);
    this.setState({
      tableBody: this.state.tableBody.concat(newItemObj)
    });
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  select(evt) {
    this.setState({
      action: evt.target.innerText,
      tableBody:[]
    });
  }

  render() {
    let {tableHeader,tableBody,action} = this.state;
    // console.log(tableBody,'in createProduct');
    let {productItems} = this.props;
    let options = this.toOptions(this.props.productItems);
    return (
      <div className="form-product">
        <ButtonDropdown direction="right" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
          <DropdownToggle caret size="sm" className="drop-down">
            {action}
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={this.select}>
              New
            </DropdownItem>
            <DropdownItem onClick={this.select}>
              Restock
            </DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        <InputField button={'submit'}
                    parent={'product'}
                    onSubmitClick={this.handleSubmitClick}
                    otherInfo={{options,productItems,action}} />
        <div className="table">
          <ShowTable  button={'delete'}
                    onClickAction={this.handleClickAction}
                    tableBody={tableBody}
                    tableHeader={tableHeader}
                    parent={'product'} />
        </div>
        <Button size="sm" onClick={this.handleSubmit}>Submit</Button>
      </div>
    )
  }
}

CreateProduct.propTypes = {
  productItems:PropTypes.array,
  onSubmit: PropTypes.func
}

export default CreateProduct;
