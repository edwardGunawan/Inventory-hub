import React, {Component} from 'react';
import {Table} from 'reactstrap';
import './ShowTable.css';

class ShowTable extends Component{
  constructor(props) {
    super(props);
    this.state = {
      products: this.props.products
    }
  }


  render() {
    let {products} = this.state;
    let renderBody = (products) => {
      return products.map((prod,i) => {
        let {code,id,amount,price} = prod;
        console.log(code);
        return (
          <tr key={i} cope="row">
            <th>id</th>
            <td>{code}</td>
            <td>{amount}</td>
            <td>{price}</td>
          </tr>
        )
      })
    }

    return (
      <Table className="table-container">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Amount</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {renderBody(products)}
        </tbody>

      </Table>
    )
  }
}

ShowTable.defaultProps = {
  product: []
}

export default ShowTable;
