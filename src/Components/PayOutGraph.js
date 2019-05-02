import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import {Line} from 'react-chartjs-2';

import BlockchainServices from '../Services/BlockchainServices';

const styles = {
  root: {
    
  }
};

class PayOutGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      unit:"weekly",
      value:"sum",
      loading: true,
      
      data: null
    };
  
  }

  componentDidMount() {
    this.getGraphData();
  }

  componentWillUnmount() {
  }
  
  onUnitChange(event){
    this.setState({unit: event.target.value});

    this.getGraphData();
  }

  onValueChange(event){
    this.setState({value: event.target.value});

    this.getGraphData();
  }

  getGraphData(){
    this.setState({loading: true});
    

    BlockchainServices.getPayoutStats(this.props.address, "masternode", this.state.unit).then(stats =>{
      debugger;
      var p = PayOutStatsToDataSetData(stats,this.state.unit, this.state.value);

      this.setState(
      {
        data:
        {
          //labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets :
          [{
            label: 'Masternode',
            backgroundColor: "rgba(255, 99, 132,0.5)",
            borderColor: "rgb(255, 99, 132)",
            fill: false,
            data: p,
          }]
        }
      });
    });
  }


  render(){
    const { classes } = this.props;
    const { unit,value, data  } = this.state;

    var graphUnit = "week";

    var options = {
      title: {
        text: 'Maternode Payouts'
      },
      scales: {
          xAxes: [{
              type: 'time',
              time: {
                  unit: 'day'
              }
          }],
          yAxes: [{
              scaleLabel: {
                  display: true,
                  labelString: 'Payouts'
              }
          }]
      }
    };

    return (
    <div>
      <Form>
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

      </Form>
      {
        data == null ? 
        "" :
        <Line data={data} options={options} />
      }
    </div>
      
    );
  }

  
}



PayOutGraph.propTypes = {
  classes: PropTypes.object.isRequired,
  address: PropTypes.string.isRequired,
};

export default withStyles(styles)(PayOutGraph);





var PayOutStatsToDataSetData = (stats, unit, value) =>{

  var data = [];
  var lastDate = null;
  for (var i = 0; i < stats.length; i++) {
    var stat = stats[i];
    var date = null;


    if (unit == "daily") date = new Date(stat._id.year, stat._id.month - 1, stat._id.day);
    if (unit == "weekly") {
        date = new Date(stat._id.year, 0, 1);
        date.setDate(stat._id.week * 7);
    }
    if (unit == "monthly") date = new Date(stat._id.year, stat._id.month - 1, 1);
    if (unit == "yearly") date = new Date(stat._id.year, 0, 1);

    if (lastDate != null) {
        var current = new Date(lastDate.getTime());

        if (unit == "daily") current.setDate(current.getDate() + 1);
        if (unit == "weekly") current.setDate(current.getDate() + 7);
        if (unit == "monthly") current.setMonth(current.getMonth() + 1);
        if (unit == "yearly") current.setFullYear(current.getFullYear() + 1);




        while (current < date) {
            data.push({
                x: current.toDateString(),
                y: 0
            });

            current = new Date(current.getTime());
            if (unit == "daily") current.setDate(current.getDate() + 1);
            if (unit == "weekly") current.setDate(current.getDate() + 7);
            if (unit == "monthly") current.setMonth(current.getMonth() + 1);
            if (unit == "yearly") current.setFullYear(current.getFullYear() + 1);
        }
    }

    data.push({
        x: date.toDateString(),
        y: value == "sum" ? stat.value : stat.count
    });

    lastDate = date;
  }

  return data;
}