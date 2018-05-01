import React, {Component} from 'react';
import {Table,Button} from 'reactstrap';
import ModalStrap from '../Modal/ModalStrap'
import PropTypes from 'prop-types';
import './ShowTable.css';
/*
  Show table get passed of props as button on the right,
  all the thead that exist in that table
  submit delete button to delete the value

  All Table component in creaetCustomer, createProduct,
  search, inout transaciton

  Props:
    Button,
    onClickAction,
    tableBody,
    tableHeader,
    from: where it is rendered from, parent component
  */

class ShowTable extends Component{
  constructor(props) {
    super(props);
    this.handleTableClick = this.handleTableClick.bind(this);
    this.launchModal = this.launchModal.bind(this);
    this.state = {
      tableBody: this.props.tableBody,
      actionButton:this.props.button,
      modal: false, // to launch on componentdidUpdate in modalStrap.js
      tableHeader: this.props.tableHeader,
      parent:this.props.parent
    }
  }

  componentDidUpdate(prevProps,prevState) {
    if(this.props.tableBody.length !== prevProps.tableBody.length) {
      console.log('here in tableBody not the same', this.props.tableBody);
      this.setState({
        tableBody: this.props.tableBody
      })
    }
  }

  // handle click on the modal
  handleTableClick = (idx) => (evt) => {
    console.log(idx,' in showTable');
    // console.log(this.state);
    // let {idx,actionButton} = this.state;
    // this.setState({
    //   modal:!this.state.modal
    // });
    this.props.onClickAction(idx); // pass it up to search to delete from db
  }

  // launch the modal
  launchModal(idx,actionButton) {
    return () => {
      this.setState({
        idx,
        actionButton,
        modal:!this.state.modal
      });
    }
  }


  render() {
    let {tableBody,actionButton,tableHeader,parent} = this.state;
    console.log(actionButton);
    console.log(parent);
    console.log(tableBody,'in showTable');
    let renderHeader = tableHeader.map((header, idx) => {
      return (
        <th key={idx}>{header}</th>
      )
    });

    let getTd = (prod,i) => {
      let {id,price,brand,code,quantity,total} = prod;
      switch(parent) {
        case 'search':
          return (
            <tr key={i}>
              <td>{id}</td>
              <td>{code}</td>
              <td>{quantity}</td>
              <td>{price}</td>
              <td>{brand}</td>
              <td><Button onClick={this.handleTableClick}>{this.state.actionButton}</Button></td>
            </tr>
          );
        case 'customer':
          let {name} = prod;
          return (
            <tr key={i}>
              <td>{name}</td>
              <td><Button onClick={this.handleTableClick(i)}>{this.state.actionButton}</Button></td>
            </tr>
          );
        case 'product':
          // let {code,brand,quantity,price} = prod;
          console.log(prod);
          return (
            <tr key={i}>
              <td>{code}</td>
              <td>{brand}</td>
              <td>{quantity}</td>
              <td>{price}</td>
              <td><Button onClick={this.handleTableClick(i)}>{this.state.actionButton}</Button></td>
            </tr>
          )
        case 'action':
          return (
            <tr key={i}>
              <td>{code}</td>
              <td>{brand}</td>
              <td>{quantity}</td>
              <td>{price}</td>
              <td>{total}</td>
              <td><Button onClick={this.handleTableClick(i)}>{this.state.actionButton}</Button></td>
            </tr>
          )
      }
    }

    let renderBodyArr = [];
    tableBody.forEach((product,idx,arr) => {
      console.log(product, 'inside product');
      // loop through each name attribute in product
      renderBodyArr.push(getTd(product,idx));
    });
    console.log(renderBodyArr);

    return (
      <div className="table-container">
        <ModalStrap idx={this.state.idx}
                    actionButton={actionButton}
                    modalTitle={"Confirmation"}
                    modal={this.state.modal}
                    onClick={this.handleTableClick} >
          Are you Sure you want to {actionButton} item id {this.state.idx} ?
        </ModalStrap>
        <Table>
          <thead>
            <tr>
              {renderHeader}
            </tr>
          </thead>
          <tbody>
            {renderBodyArr}
          </tbody>
        </Table>
      </div>
    )
  }
}

ShowTable.defaultProps = {
  tablebody: [],
  actionButton: 'Button'
}

ShowTable.propTypes = {
  button: PropTypes.string, // name of the button on the side
  onClickAction: PropTypes.func, // the eventListener of the buttonClick
  tableBody: PropTypes.array, // content for tableBody (array of objects)
  tableHeader:PropTypes.array, // description for table header
  parent:PropTypes.string // parent component that is passed
}

export default ShowTable;
