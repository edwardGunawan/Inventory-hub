import React, {Component} from 'react';
import {
  FormGroup,
  Label,
  Input,
  Button
} from 'reactstrap';
import './InputList.css';

/*
  This Component will serve as Input List,
  Configuring all the input list, and adding to bulkCreate
  or Inout for a list of input

  Dynamic InputField


  Props:
    LeftButton
    RightButton
    insideCreate: what parent component is passed,
    inputList: list of input field, object of name and value
    action: buy or sell for inout
    discount: discount for inout
    customerNames: customer for inout
*/

class InputList extends Component {
   constructor(props) {
     super(props);
     this.handleAddItem = this.handleAddItem.bind(this);
     this.handleDeleteItem = this.handleDeleteItem.bind(this);
     this.handleInputChange = this.handleInputChange.bind(this);
     this.handleSubmit = this.handleSubmit.bind(this);
     this.onClickAction = this.onClickAction.bind(this);
     this.onChangeInOut = this.onChangeInOut.bind(this);
     this.handleChange = this.handleChange.bind(this);
     this.state = {
       inputList: [this.props.inputField], // passing in for all the attributes
       action:'sold',
       discount:0,
       customer:'',// when select the customer in dropdown input
       selectedOption:''
     }
   }

   // using concat to add element to not mutate it
   handleAddItem = () => {
     this.setState({
       inputList: this.state.inputList.concat(this.props.inputField)
     });
   }

   // using filter to remove element to not mutate it
   handleDeleteItem = (idx) => () => {
     this.setState({
       inputList: this.state.inputList.filter((currList,i) => i !== idx)
     });
   }

   // TODO: Handling incorrect value
   handleInputChange = (idx) => (evt) => {
     // based on which value changes it will show that the component of the name and value
     let {value,name} = evt.target;
     // console.log(evt.target.name,evt.target.value,idx,evt.target);
     this.setState({
       inputList:this.state.inputList.map((currList, i) => {
         if(idx !== i) return currList;
         // this will create a new object with all the currList item
         // and the one that is updated
         return {...currList, [`${name}`]:value}
       })
     })
   }

   handleSubmit = (e) => {
     e.preventDefault();
     console.log(this.state);
     console.log(this.state.inputList);
     console.log('click handleSubmit');
     this.props.onSubmitInputList(this.state);
   }

   onClickAction(action) {
     console.log(action);
   }

   // changing value in inout
   onChangeInOut(e) {
     console.log(e.target.name, e.target.value);
     this.setState({
       [`${e.target.name}`]: e.target.value
     });
   }

   handleChange = (selectedOption) => {
    this.setState({ selectedOption });
    console.log(`Selected: ${selectedOption.label}`);
  }


  render() {
    // rendering input group and label over here
    let {inputList,selectedOption} = this.state;
    let value = selectedOption & selectedOption.value;
    let {insideCreate,customerNames} = this.props;
    let renderInput = (inputList) => {
      return inputList.map((item, idx) => {
        if(insideCreate === 'product') {
          let {code,amount,price,brand} = item;
          return (
            <FormGroup className="formGroup-container" onChange={this.handleInputChange(idx)} key={idx}>
              <Label for={`code_${idx}`}>Code</Label>
              <Input name="code" type="text" id={`code_${idx}`} placeholder="code"/>
              <Label for={`brand_{idx}`}>Model</Label>
              <Input name="brand" type="text" id={`brand_${idx}`} placeholder="model/brand"/>
              <Label for={`quantity_${idx}`}>Quantity</Label>
              <Input name="quantity" type="number" step="1" placeholder="quantity" />
              <Label for={`price_${idx}`}>Price</Label>
              <Input name="price" type="number" placeholder="Price"/>
              <Button className="button-delete"onClick={this.handleDeleteItem(idx)}>Delete</Button>
            </FormGroup>
          );
        }else if(insideCreate === 'inout') {
          return (
            <FormGroup className="formGroup-container" onChange={this.handleInputChange(idx)} key={idx}>
              <Label for={`code_${idx}`}>Code</Label>
              <Input name="code" type="text" id={`code_${idx}`} placeholder="code"/>
              <Label for={`quantity_${idx}`}>Quantity</Label>
              <Input name="quantity" type="number" step="1" placeholder="quantity" />
              <Button className="button-delete"onClick={this.handleDeleteItem(idx)}>Delete</Button>
            </FormGroup>
          )
        } else if(insideCreate === 'customer') {
          return (
            <FormGroup className="formGroup-container" onChange={this.handleInputChange(idx)} key={idx}>
              <Label for={`name_${idx}`}>Customer Name</Label>
              <Input name="name" type="text" id={`name_${idx}`} placeholder="name"/>
              <Button className="button-delete"onClick={this.handleDeleteItem(idx)}>Delete</Button>
            </FormGroup>
          )
        }
      });
    }

    let renderInout = (insideCreate) => {
      if(insideCreate === 'inout') {
        return (
          <FormGroup onChange={this.onChangeInOut}>
            <Label for="customer">Customer</Label>
            <Input type="select" name="customer" id="customer">
              {customerNames.map((name,i) => <option key={i}>{name}</option>)}
            </Input>
            <Label for="action">Action</Label>
            <Input type="select" name="select" id="action">
              <option>Sold</option>
              <option>Return</option>
            </Input>
            <Label for="discount">Discount</Label>
            <Input type="number" name="discount" id="discount" />
          </FormGroup>
        )
      }
    }
    // adding scrollable div
    // let formStyle={overflowY:'auto', width:'100%', height:'500px',paddingBottom:'30px'};
    return (
      <div className="form-container" onSubmit={this.handleSubmit}>
        {renderInput(inputList)}
        {renderInout(insideCreate)}
        <Button className="add-submit" onClick={this.handleAddItem}>Add</Button>
        <Button className="add-submit" onClick={this.handleSubmit}>Submit</Button>
      </div>
    )
  }
}


InputList.defaultProps = {
  insideCreate:true,
  inputField: {},
  customer:''
}
export default InputList;
