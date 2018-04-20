import React, {Component} from 'react';
import ShowTable from '../ShowTable/ShowTable';
import {Progress,
        Input
        } from 'reactstrap';
import './Search.css'

const lunr = window.require('lunr');
let {ipcRenderer} = window.require('electron');

// let debounce = (fn, delay) => {
//   let timer = null;
//   return () => {
//     let context
//   }
// }

class Search extends Component {
  constructor(props) {
    super(props);
    this.handleClickAction = this.handleClickAction.bind(this);
    // debouncing
    // this.handleSearch = debounce(this.handleSearch.bind(this),1000);
    this.handleSearch = this.handleSearch.bind(this);
    this.state = {
      toRender:null
    }
  }
  componentWillMount() {
    console.log('Go through component Will Mount in Search');
    ipcRenderer.send('show', 'Initialized');
    ipcRenderer.on('reply-show', (event,arg) => {
      let {status, message} = arg;
      if(status === 'OK') {
        console.log(message);
        // importing lunr through here in component will mount
        let idx = lunr(function() {
          this.ref('id')
          this.field('code')
          this.field('amount')
          this.field('price')

          message.forEach(function(product) {
            this.add(product)
          },this)
        });
        this.setState({
          idx,
          message,
          toRender:message
        })
      }else {
        console.log(message);
      }
    })
  }

  handleClickAction(idx,actionButton) {
    console.log('click', idx, actionButton);
    this.setState({
      toRender:null
    }); // to load progress

    // fake timer for now
    setTimeout(() => {
      this.setState({
        toRender:this.state.message
      })
    },5000)
    // TODO:
    // Delete from IPCRenderer
    // render back to state for product
  }

  handleSearch(e) {
    console.log(e.target.value);
  }

  render() {
    let{options} = this.props;
    let {toRender} = this.state;
    console.log(toRender);
    return (
      <div>
        {options}
        <Input type="text" placeholder="search" onChange={this.handleSearch}/>
        <div className="progress-table-container">
          {(toRender) ? <ShowTable options={options} onClickAction={this.handleClickAction} products={toRender}/>:
            <Progress animated color="info" value="100"/> }
        </div>
      </div>
    )
  }
}

export default Search;
