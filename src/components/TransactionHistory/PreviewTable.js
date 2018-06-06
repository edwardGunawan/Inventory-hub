import React, {Component} from 'react';
import { Table } from 'reactstrap';
import PropTypes from 'prop-types';
import './PreviewTable.css';

class PreviewTable extends Component{
  constructor(props) {
    super(props);
    this.renderTableBody = this.renderTableBody.bind(this);
  }

  renderTableBody() {
    return this.props.tableBody.map((o,i) => {
      return (
        <tr key={i}>
          {Object.keys(o).map((content,j) => {
            return <td key={j}>{o[content]}</td>
          })}
        </tr>
      )
    });
  }

  render() {
    return (
      <div className="preview-table-container">
        <Table striped>
          <thead>
            <tr>
              {this.props.tableHeader.map((title,i) => {
                return <th key={i}>{title.toUpperCase()}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {this.renderTableBody()}
          </tbody>
        </Table>
      </div>
    )
  }
}



PreviewTable.propTypes = {
  tableHeader : PropTypes.arrayOf(PropTypes.string),
  tableBody: PropTypes.array
}

export default PreviewTable;
