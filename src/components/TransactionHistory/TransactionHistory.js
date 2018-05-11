import React, {Component} from 'react';
const {ipcRenderer} = window.require('electron');

class TransactionHistory extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('go through componentDidMount in transactionHistory');
  }

  render() {
    return (
      <div>
        Transaction History Component
      </div>
    );
  }
}

export default TransactionHistory;
