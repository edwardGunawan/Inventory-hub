import React, {Component} from 'react';
import CreateProduct from './CreateProduct';
import CreateCustomer from './CreateCustomer';
import { ButtonDropdown,
        DropdownToggle,
        DropdownMenu,
        DropdownItem } from 'reactstrap';

class Create extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    this.state = {
      dropdownOpen: false,
      content:'What do you want to create?', // content for dropdownToggle
      value:''
    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  select(e) {
    console.log(e.target.innerText);
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
      content: e.target.innerText,
      value: (e.target.innerText === 'Create Product') ? <CreateProduct/> : <CreateCustomer/>
    });
  }




  render() {
    // TODO Set variable as the renderer as the button part
    let {content,value,dropdownToggle} = this.state;
    return (
      <div>
        <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
          <DropdownToggle caret>
            {content}
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={this.select}>
              Create Product
            </DropdownItem>
            <DropdownItem onClick={this.select}>
              Create Customer
            </DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        {value}
      </div>

    )
  }
}

export default Create;
