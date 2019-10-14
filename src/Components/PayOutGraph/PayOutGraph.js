import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';


import BlockchainServices from '../../Services/BlockchainServices';
import LineGraph from './LineGraph';
import StackGraph from './StackGraph';

const styles = {
  root: {
    "overflow":"scroll"
  },
  form: {
    "min-width":"1000px"
    
  }
};

class PayOutGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      unit:"weekly",
      value:"sum",
      loading: true,
      
      graph: "line",
      addressStates: null
    };

  }

  componentDidMount() {
    this.getGraphData();
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps) {
    if (this.props.addresses  != prevProps.addresses || this.props.names  != prevProps.names || this.props.payOutType  != prevProps.payOutType) this.getGraphData();
  }

  onGraphChange = (event) => {
    this.setState({graph: event.target.value},this.getGraphData);
  }
  
  onUnitChange = (event) =>{
    this.setState({unit: event.target.value}, this.getGraphData);

    this.getGraphData();
  }

  onValueChange = (event) => {
    this.setState({value: event.target.value},this.getGraphData);
  }


  getGraphData(){
    this.setState({loading: true});
    
    var { addresses, payOutType} = this.props;
    var { unit } = this.state;


    var promises = addresses.map(address => BlockchainServices.getPayoutStats(address, payOutType, unit));

    Promise.all(promises).then((addressStates) => {
      this.setState({
        addressStates
      })
    });

  }


  render(){
    const { classes, addresses, names } = this.props;
    const { graph, unit, value, addressStates  } = this.state;



    return (
    <div className={this.props.classes.root}>
      <Form className={this.props.classes.form}>
        <FormGroup>
          <Label>Graph</Label>
          <Input type="select" value={graph} onChange={this.onGraphChange}>
            <option value="line">Line</option>
            <option value="stack">Stack</option>
          </Input>
        </FormGroup>

        <FormGroup>
          <Label>Unit</Label>
          <Input type="select" value={unit} onChange={this.onUnitChange}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Input>
        </FormGroup>

        <FormGroup>
          <Label>Value</Label>
          <Input type="select" value={value} onChange={this.onValueChange}>
            <option value="sum">Sum</option>
            <option value="count">Count</option>
          </Input>
        </FormGroup>

        {
          addressStates == null ? 
          "" :
          (
            <>
            {
              graph != "line" ?
              null :
              <LineGraph unit={unit} value={value}  addresses={addresses} names={names} addressStates={addressStates} />
            }
            {
              graph != "stack" ?
              null :
              <StackGraph unit={unit} value={value}  addresses={addresses} names={names} addressStates={addressStates} />
            }
            </>
          )
        }
      </Form>
      
    </div>
      
    );
  }

  
}



PayOutGraph.propTypes = {
  classes: PropTypes.object.isRequired,
  addresses: PropTypes.array.isRequired,
  payOutType: PropTypes.string.isRequired
};

export default withStyles(styles)(PayOutGraph);




