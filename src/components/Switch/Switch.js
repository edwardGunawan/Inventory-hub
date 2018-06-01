import React, {Component} from 'react';
import {ButtonDropdown,DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

const SwitchClass = defaultState => (ComponentA,ComponentB) => {
  return class Switch extends Component {
    constructor(props) {
      super(props);
      this.state = {
        header: defaultState.header,
        componentA: defaultState.componentA,
        componentB: defaultState.componentB,
        content:'',
        dropdownOpen:false
      }
      this.toggle = this.toggle.bind(this);
      this.handleClick = this.handleClick.bind(this);
    }

    toggle() {
      this.setState({dropdownOpen:!this.state.dropdownOpen});
    }

    handleClick = (name) => e => {
      this.setState({
        content: (name === 'componentA') ? <ComponentA /> : <ComponentB />,
        header: defaultState[name]
      });
    }

    render() {
      let {header,componentA,componentB,dropdownOpen,content} = this.state;
      return (
        <div>
          <ButtonDropdown isOpen={dropdownOpen} toggle={this.toggle}>
            <DropdownToggle caret>
              {header}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={this.handleClick('componentA')}>{componentA}</DropdownItem>
              <DropdownItem onClick={this.handleClick('componentB')}>{componentB}</DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
          {content}
        </div>
      )
    }
  }
}

const Switch = (category,componentA,componentB) => (ComponentA,ComponentB) => {
  let defaultState = null;
  switch(category) {
    case 'update':
      defaultState = {
        header: 'Which category do you want to update?',
        componentA:componentA,
        componentB:componentB
      }
      break;
    case 'delete':
      defaultState = {
        header:'Which category do you want to delete?',
        componentA: componentA,
        componentB:componentB
      }
      break
  }
  return SwitchClass(defaultState)(ComponentA,ComponentB);
}

export default Switch;
