import React,{Component} from 'react';
import PropTypes from 'prop-types';
import {Container,Row,Col} from 'reactstrap';
import Select from 'react-select';
import moment from 'moment';
import './Filter.css';

class Filter extends Component {
  constructor(props) {
    super(props);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.toOption = this.toOption.bind(this);
    this.disabledFilter = this.disabledFilter.bind(this);
    this.state = {
      startOptions:[],
      endOptions: [],
      actionOptions:[],
      codeOptions:[],
      customerOptions:[],
      beginTimestamps:'',
      disabled:true,
      transactionHistory:{}
    }
  }

  componentWillUpdate(nextProps,nextState) {
    if(nextProps.dates !== this.props.dates){
      console.log(nextProps.dates);
      this.setState({
        beginTimestamps:0,
        disabled:true,
        startDateValue:'', // all value option is cleared
        endDateValue:'', // all vlaue option is cleared
        transactionHistory:{}, // reset the entire transactionHistory
        codeDateValue:'',
        customerDateValue:'',
        actionDateValue:''
      })
      this.toOption(nextProps.dates,'startOptions');
    }
    if(nextProps.transactionHistory !== this.props.transactionHistory) {
      // console.log('go through transactionHistory', nextProps.filter.codeOptions);
      // this.showFilter(nextProps.optionTitle);
      this.setState({
        transactionHistory:nextProps.transactionHistory,
        actionOptions: nextProps.filter.actionOptions,
        codeOptions: nextProps.filter.codeOptions,
        customerOptions: nextProps.filter.customerOptions
      });
    }
  }

  handleSelectChange(category) {
    return (selectedOption) => { // apply currying for all filter
      if(selectedOption !== null && typeof selectedOption.value !== 'undefined') {
        let {value,label} = selectedOption;
        console.log('selecteOption', selectedOption);
        switch(category) {
          case 'startOptions':
            let filterDate = this.props.dates.filter((date) => moment(date,["MM-DD-YYYY", "YYYY-MM-DD"]).isAfter(moment(label,["MMM-DD-YYYY", "YYYY-MMM-DD"])));
            let disabled = filterDate.length === 0;
            this.toOption(filterDate,'endOptions');
            this.setState({beginTimestamps:value,startDateValue:selectedOption,endDateValue:'', disabled});
            if(filterDate.length === 0) {
              this.setState({endDateValue:{label:'No Options For End Date'}})
              this.props.onChangeDate({beginTimestamps:value});
            }
            break;
          case 'endOptions':
            this.setState({endDateValue:selectedOption});
            this.props.onChangeDate({beginTimestamps:this.state.beginTimestamps,endTimestamps:value});
            break;
          default:
            let attr = category.substring(0,category.indexOf('Options'));
            // console.log('selectedOption in default', selectedOption);
            this.setState({[`${attr}DateValue`]:selectedOption});
            this.props.onFilter({[`${attr}`]:value});
        }
      } else {
        let attr = category.substring(0,category.indexOf('Options'));
        this.setState({[`${attr}DateValue`]:''});
        this.props.onFilter({[`${attr}`]:''});
      }
    }
  }


  // Change dates to option to render
  // change it to moment of year and month
  // array of dates
  toOption(dates,optionType){
    let option = dates.map((date) => {
      return {value:moment(date).valueOf(),label:moment(date).format('MMM-DD-YYYY')};
    });
    this.setState({[optionType]:option});
  }


  disabledFilter(category) {
    const {transactionHistory} = this.state;
    let bool = !(typeof transactionHistory !== 'undefined' && transactionHistory.length > 0);
    switch(this.props.optionTitle) {
      case 'Product':
        return !(category === 'code' || category === 'action') || bool;
      case 'Customer':
        return !(category === 'action') || bool;
      default:
        return false || bool;
    }
  }

  render() {
    let {startOptions,
        endOptions,
        actionOptions,
        codeOptions,
        customerOptions,
        disabled,
        startDateValue,
        endDateValue,
        codeDateValue,
        customerDateValue,
        actionDateValue} = this.state;

    return (
      <div>
        <Container className="filter-container">
          <Row>
            <Col sm="6"><Select value={startDateValue} styles={selectCustomStyle} onChange={this.handleSelectChange('startOptions')} options={startOptions} placeholder="start date"/></Col>
            <Col sm="6"><Select value={endDateValue} styles={selectCustomStyle} onChange={this.handleSelectChange('endOptions')} options={endOptions} placeholder="end date" isDisabled={disabled}/></Col>
          </Row>
        </Container>
        <Container className="filter-container">
          <Row>
            <Col sm="4"><Select value={codeDateValue} styles={selectCustomStyle} onChange={this.handleSelectChange('codeOptions')} options={codeOptions} placeholder="code" isDisabled={this.disabledFilter('code')} isClearable={true}/></Col>
            <Col sm="4"><Select value={customerDateValue} styles={selectCustomStyle} onChange={this.handleSelectChange('customerOptions')} options={customerOptions} placeholder="customer name" isDisabled={this.disabledFilter('customer')} isClearable={true}/></Col>
            <Col sm="4"><Select value={actionDateValue} styles={selectCustomStyle} onChange={this.handleSelectChange('actionOptions')} options={actionOptions} placeholder="action type" isDisabled={this.disabledFilter('action')} isClearable={true}/></Col>
          </Row>
        </Container>
      </div>
    )
  }
}

const selectCustomStyle = {
  singleValue: (base,state) => {
    const opacity = state.isDisabled ? 0.1 : 1;
    const transition = 'opacity 300ms';
    return { ...base, opacity, transition};
  }
}

Filter.propTypes = {
  optionTitle: PropTypes.string, // whats the parent element
  filter: PropTypes.objectOf(PropTypes.array), // the filter options based on each optionTitle
  transactionHistory: PropTypes.arrayOf(PropTypes.object), // filter content after user changing the selection
  dates: PropTypes.arrayOf(PropTypes.string), // dates
  onChangeDate: PropTypes.func, // handling dates change
  onFilter: PropTypes.func // handling filter change
}

export default Filter;
