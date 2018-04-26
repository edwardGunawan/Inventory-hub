import React, {Component} from 'react';
import ShowTable from '../ShowTable/ShowTable';
import {Progress,
        Input
        } from 'reactstrap';
import './Search.css';
import debounce from 'lodash/debounce';

const lunr = window.require('lunr');
let {ipcRenderer} = window.require('electron');



class Search extends Component {
  constructor(props) {
    super(props);
    console.log(this.props.access === 'public_username');
    this.handleClickAction = this.handleClickAction.bind(this);
    // debouncing
    this.handleSearch = debounce(this.handleSearch,500);
    this.state = {
      toRender:null,
      isLoaded:true,
      showTableButton: (this.props.access === 'public_username')? 'Delete' : 'Edit'
    }
  }
  componentDidMount() {
    // debounce
    // this.handleSearch= debounce(this.handleSearch,500)
    console.log('Go through component Did Mount in Search');
    ipcRenderer.send('show', 'Initialized');
    ipcRenderer.on('reply-show', (event,arg) => {
      let {status, message} = arg;
      if(status === 'OK') {
        // console.log(message);
        // importing lunr through here in component will mount
        let idx = lunr(function() {
          this.ref('id')
          this.field('code')
          this.field('amount')
          this.field('price')
          this.field('brand')

          message.forEach(function(product) {
            this.add(product)
          },this)
        });

        // This is causing warning idk how to solve it
        this.setState({
          idx,
          message,
          toRender:message,
          isLoaded:false,
          tableHeader:['id','code','quantity','price','brand','action']
        });
      }else {
        console.log(message);
      }
    },this)
  }

  // to not show any problem with force update
  // cancel all listeners
  componentWillUnmount() {
    ipcRenderer.removeAllListeners('show');
    ipcRenderer.removeAllListeners('reply-show');
  }

  handleClickAction(idx,actionButton) {
    console.log('click', idx, actionButton);
    this.setState({
      isLoaded:true
    }); // to load progress

    // fake timer for now
    setTimeout(() => {
      this.setState({
        toRender:this.state.message,
        isLoaded:false
      })
    },5000)
    // TODO:
    // Delete from IPCRenderer
    // render back to state for product
  }

  // making onSearch as a regular function, not an event listener
  // then call handleSearch through debounce that is in ctor
  onSearch = (val) => {
    // console.log(e.target.val);
    this.handleSearch(val);

  };

  handleSearch = (val) => {
    // console.log(val, 'in handleSearch');
    if(val.length > 0) {
      // console.log(this.state.idx);
      let {idx, message} = this.state;
      let res = idx.search(`${val}`);
      let firstIdx = res[0];
      let toRender = res.map((item) => {
        let {ref} = item;
        for(let {id,code,quantity,price,brand} of message) {
          // NOTE: ref is object and id is number type
          if(Number(ref) === id) {
            return {
              id,
              code,
              quantity,
              price,
              brand
            }
          }
        }
      });
      this.setState({
        toRender
      });
    } else {
      this.setState({
        toRender: this.state.message
      });
    }
  }





  render() {
    let{access} = this.props;
    let {toRender,isLoaded,showTableButton,tableHeader} = this.state;
    // console.log(toRender);
    return (
      <div>
        {access}
        <Input type="text" placeholder="search" onChange={(e) => this.onSearch(e.target.value)}/>
        <div className="progress-table-container">
          {(isLoaded) ? <Progress animated color="info" value="100"/>:
             <ShowTable
               access={access}
               button={showTableButton}
               onClickAction={this.handleClickAction}
               tableBody={toRender}
               tableHeader={tableHeader}
               parent={'search'}/>}
        </div>
      </div>
    )
  }
}

export default Search;
