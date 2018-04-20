import React, {Component} from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class ModalStrap extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      modal:false
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.modal !== this.props.modal) {
      console.log(prevProps.modal , this.props.modal);
      this.setState({
        modal:!this.state.modal
      })
    }
  }



  toggle(val) {
    this.setState({
      modal: !this.state.modal
    })
  }

  render() {
    let {actionButton,modalTitle} = this.props;
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>{modalTitle}</ModalHeader>
          <ModalBody>
            {this.props.children}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={e=> this.props.onClick(actionButton)}>{actionButton}</Button>
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
      </Modal>
    )
  }
}

export default ModalStrap;
