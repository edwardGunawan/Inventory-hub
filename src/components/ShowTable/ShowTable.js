import React, {Component} from 'react';
import {Table,Button} from 'reactstrap';
import ModalStrap from '../Modal/ModalStrap'
import './ShowTable.css';
/*
  Show table get passed of props as button on the right,
  all the thead that exist in that table
  submit delete button to delete the value

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
      from:this.props.from
    }
  }

  componentDidUpdate(prevProps,prevState) {
    if(this.props.tableBody.length !== prevProps.tableBody.length) {
      this.setState({
        tableBody: this.props.tableBody
      })
    }
  }

  // handle click on the modal
  handleTableClick (ans) {
    console.log(ans);
    console.log(this.state);
    let {idx,actionButton} = this.state;
    this.setState({
      modal:!this.state.modal
    });
    this.props.onClickAction(idx,actionButton); // pass it up to search to delete from db
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
    let {tableBody,actionButton,tableHeader,from} = this.state;
    console.log(actionButton);

    let renderHeader = tableHeader.map((header, idx) => {
      return (
        <th key={idx}>{header}</th>
      )
    });

    let getTd = (prod,i) => {
      switch(from) {
        case 'search':
          let {id,price,brand,code,quantity} = prod;
          return (
            <tr key={i}>
              <td>{id}</td>
              <td>{code}</td>
              <td>{quantity}</td>
              <td>{price}</td>
              <td>{brand}</td>
              <td><Button>{this.state.actionButton}</Button></td>
            </tr>
          );
      }
    }

    let renderBodyArr = [];
    tableBody.forEach((product,idx,arr) => {
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

export default ShowTable;
