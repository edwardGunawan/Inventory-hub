import React, {Component} from 'react';
import {Button, Form, FormGroup,FormText, Label, Input} from 'reactstrap';
const {ipcRenderer} = window.require('electron');

class BulkCreate extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      path:''
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

  handleClick(e) {
    e.preventDefault();
    console.log(this.state.path);
    ipcRenderer.send('bulk-import', {path:this.state.path});
    ipcRenderer.on('reply-bulk-import', (event,arg) => {
      let {status,message} = arg;
      if(status === 'OK') {
        console.log('Success');
      } else {
        console.log(message);
      }
    });
    // console.log(this.state.path);
    // ipcRenderer here for handling path
  }

  render() {
    return (
      <Form>
        <FormGroup>
          <Label for="excelImport">File</Label>
          <Input type="file" innerRef="import" onChange={(e) => this.handleChange(e.target.files)} name="file" id="excelImport"/>
          <FormText color="muted">
            Find Excel Sheet to import to the database
          </FormText>
          <Button onClick={this.handleClick}>Import!</Button>
        </FormGroup>
      </Form>
    )
  }
}

export default BulkCreate;
