import React, {Component} from 'react';
import {Button,
        FormGroup,
        FormText,
        Label,
        Input
      } from 'reactstrap';
import PropTypes from 'prop-types';
// import InputList from '../Input/InputList';
import ShowTable from '../ShowTable/ShowTable';
import InputField from '../Input/InputField';
import './CreateProduct.css';
const {ipcRenderer} = window.require('electron');

class CreateProduct extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleClickImport = this.handleClickImport.bind(this);
    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    // this.handleSelectEnter = this.handleSelectEnter.bind(this);
    this.handleClickAction = this.handleClickAction.bind(this);
    this.toOptions = this.toOptions.bind(this);
    this.state = {
      path:'',
      isBulkCreate: false,
      buttonName: 'Manual Create Product', // buttonName for toggle button
      tableHeader:['Code','Brand', 'Quantity', 'Price','Action'],
      tableBody:[]
    }
  }
  handleChange(files) {
    console.log(files[0]);
    this.setState({
      path: files[0].path
    });
    // if it is not .xlsx format it should return error
    // this.props.onImportExcel(files[0].path);
    // console.log(this.props.history.push('/Search')); // push to router history
  }

  //TODO: Handling non .xlxs file
  handleClickImport(e) {
    e.preventDefault();

    // path is a string
    if(this.state.path.length > 0){
      ipcRenderer.send('bulk-import', {path:this.state.path});
      ipcRenderer.on('reply-bulk-import', (event,arg) => {
        let {status,message} = arg;
        if(status === 'OK') {
          console.log('Success');
        } else {
          console.log(message);
        }
      });
    }

  }

  handleToggleClick() {
    this.setState({
      isBulkCreate: !this.state.isBulkCreate,
      buttonName: (this.state.buttonName === 'Manual Create Product') ? 'Import Excel' : 'Manual Create Product'
    });
  }

  handleSubmit() {
    // console.log('go throughha');
    let{tableBody} = this.state;
    // tableBody.forEach((inputObj) => {
    //   console.log(inputObj);
    // });
    this.props.onSubmit(tableBody,'createProduct');
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

  render() {
    let {isBulkCreate,tableHeader,tableBody} = this.state;
    // console.log(tableBody,'in createProduct');
    let {productItems} = this.props;
    let options = this.toOptions(this.props.productItems);
    let toogle = () => {
      if(isBulkCreate) {
        return (
          <FormGroup>
            <Label for="excelImport">File</Label>
            <Input type="file" innerRef="import" onChange={(e) => this.handleChange(e.target.files)} name="file" id="excelImport"/>
            <FormText color="muted">
              Find Excel Sheet to import to the database
            </FormText>
            <Button onClick={this.handleClickImport}>Import!</Button>
          </FormGroup>
        )
      } else {
        return (
          <div>
            <InputField button={'create'}
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
            <Button onClick={this.handleSubmit}>Submit</Button>
          </div>
        )
      }
    }
    return (
      <div className="form-product">
        {/*}<Button onClick={this.handleToggleClick}>{buttonName}</Button> */}
        {toogle()}
      </div>
    )
  }
}

CreateProduct.propTypes = {
  productItems:PropTypes.array,
  onSubmit: PropTypes.func
}

export default CreateProduct;
