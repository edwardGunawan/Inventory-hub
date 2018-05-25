import React,{Component} from 'react';
import PropTypes from 'prop-types';
import {Container,Row,Col} from 'reactstrap';
import Select from 'react-select';
import moment from 'moment';

class Filter extends Component {
  constructor(props) {
    super(props);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.toOption = this.toOption.bind(this);
    this.filterObj = this.filterObj.bind(this);
    this.showFilter = this.showFilter.bind(this)
    this.state = {
      startOptions:[],
      endOptions: [],
      beginTimestamps:'',
      disabled:true,
      transactionHistory:{},
      filterComponent:''
    }
  }

  componentWillUpdate(nextProps,nextState) {
    if(nextProps.dates !== this.props.dates){
      console.log(nextProps.dates);
      this.setState({
        beginTimestamps:0,
        disabled:true,
        startDateValue:'', // all value option is cleared
        endDateValue:'' // all vlaue option is cleared
      })
      this.toOption(nextProps.dates,'startOptions');
    }
    if(nextProps.transactionHistory !== this.props.transactionHistory) {
      console.log('go through transactionHistory');
      this.showFilter(nextProps.optionTitle);
      this.setState({transactionHistory:nextProps.transactionHistory});
    }
  }

  handleSelectChange(category) {
    return (selectedOption) => { // apply currying for all filter
      if(selectedOption !== null && typeof selectedOption.value !== 'undefined') {
        let {value,label} = selectedOption;
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
        }
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

  // TODO:
  /*
    dynamic filter option
  */
  filterObj(transactionHistory) {

  }
  //TODO
  /*
    getting the filtered Component
  */
  showFilter(optionTitle){
    let filterComponent;
    switch(optionTitle) {
      case 'Order':
        break;
      case 'Product':
        break;
      case 'Customer':
        break;
    }
    this.setState({filterComponent});
  }



  render() {
    let {startOptions,
        endOptions,
        disabled,
        startDateValue,
        endDateValue,
        filterComponent} = this.state;
    return (
      <div>
        <Container>
          <Row>
            <Col sm="6"><Select value={startDateValue} onChange={this.handleSelectChange('startOptions')} options={startOptions} placeholder="start date"/></Col>
            <Col sm="6"><Select value={endDateValue} onChange={this.handleSelectChange('endOptions')} options={endOptions} placeholder="end date" isDisabled={disabled}/></Col>
          </Row>
        </Container>
        <Container>
          {filterComponent}
        </Container>
      </div>
    )
  }
}

Filter.propTypes = {
  optionTitle: PropTypes.string, // whats the parent element
  filter: PropTypes.arrayOf(PropTypes.object), // the filter options based on each optionTitle
  transactionHistory: PropTypes.arrayOf(PropTypes.object), // filter content after user changing the selection
  dates: PropTypes.arrayOf(PropTypes.string), // dates
  onChangeDate: PropTypes.func, // handling dates change
  onFilter: PropTypes.func // handling filter change
}

export default Filter;
