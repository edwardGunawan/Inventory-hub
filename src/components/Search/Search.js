import React, {Component} from 'react';
import ShowTable from '../ShowTable/ShowTable';
import {Progress} from 'reactstrap';

const lunr = window.require('lunr');
let {ipcRenderer} = window.require('electron');



class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message:null
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
          message
        })
      }else {
        console.log(message);
      }
    })
  }

  render() {
    let{options} = this.props;
    let {message} = this.state;
    console.log(message);
    return (
      <div>
        {options}
        Search Component
        {(message) ? <ShowTable products={message}/>:
          <Progress animated color="info" value="100"/> }

      </div>
    )
  }
}

export default Search;
