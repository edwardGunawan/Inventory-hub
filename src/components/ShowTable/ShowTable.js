import React, {Component} from 'react';
import {Table,Button} from 'reactstrap';
import ModalStrap from '../Modal/ModalStrap'
import './ShowTable.css';

class ShowTable extends Component{
  constructor(props) {
    super(props);
    this.handleTableClick = this.handleTableClick.bind(this);
    this.launchModal = this.launchModal.bind(this);
    this.state = {
      products: this.props.products,
      actionButton:(this.props.options === 'admin_username')? 'Edit' : 'Delete',
      modal: false // to launch on componentdidUpdate in modalStrap.js
    }
  }

  componentDidUpdate(prevProps,prevState) {
    if(this.props.products.length !== prevProps.products.length) {
      this.setState({
        products: this.props.products
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
    let {products,actionButton} = this.state;
    let renderBody = (products) => {
      return products.map((prod,i) => {
        let {code,id,amount,price,brand} = prod;
        return (
          <tr key={i} scope="row">
            <th>{id}</th>
            <td>{code}</td>
            <td>{brand}</td>
            <td>{amount}</td>
            <td>{price}</td>
            <td><Button onClick={this.launchModal(i, actionButton)}>{actionButton}</Button></td>
          </tr>
        )
      })
    }
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
              <th>#</th>
              <th>Code</th>
              <th>Brand/Model</th>
              <th>Amount</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {renderBody(products)}
          </tbody>
        </Table>
      </div>

    )
  }
}

ShowTable.defaultProps = {
  product: []
}

export default ShowTable;
