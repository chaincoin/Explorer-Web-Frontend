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

    this.payOutsLineColours = [
      "rgb(230, 25, 75)", "rgb(60, 180, 75)", "rgb(255, 225, 25)", 
      "rgb(0, 130, 200)", "rgb(245, 130, 48)", "rgb(145, 30, 180)", 
      "rgb(70, 240, 240)", "rgb(240, 50, 230)", "rgb(210, 245, 60)", 
      "rgb(250, 190, 190)", "rgb(0, 128, 128)", "rgb(230, 190, 255)", 
      "rgb(170, 110, 40)", "rgb(255, 250, 200)", "rgb(128, 0, 0)", 
      "rgb(170, 255, 195)", "rgb(128, 128, 0)", "rgb(255, 215, 180)", 
      "rgb(0, 0, 128)", "rgb(128, 128, 128)", "rgb(0, 0, 0)"];
  
  }

  componentDidMount() {
    this.getGraphData();
  }

  componentWillUnmount() {
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
    
    var { addresses, names, payOutType} = this.props;
    var { unit, value } = this.state;


    var promises = addresses.map(address => BlockchainServices.getPayoutStats(address, payOutType, unit));

    Promise.all(promises).then((addressStates) => {


      var datasets = addressStates.map((stats,i) => {
        return {
          label: names == null ? addresses[i] : names[i],
          backgroundColor: this.payOutsLineColours[i % this.payOutsLineColours.length],
          borderColor: this.payOutsLineColours[i % this.payOutsLineColours.length],
          fill: false,
          data: PayOutStatsToDataSetData(stats,unit, value),
        };
      });

      this.setState(
      {
        data:
        {
          //labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets :datasets
        }
      })



    });
    /*BlockchainServices.getPayoutStats(address, payOutType, unit).then(stats =>{
      debugger;
      var p = PayOutStatsToDataSetData(stats,unit, value);

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
    });*/
  }


  render(){
    const { classes } = this.props;
    const { unit,value, data  } = this.state;

    var graphUnit = "week";

    if (unit == "daily") graphUnit = "day";
    if (unit == "weekly") graphUnit = "week";
    if (unit == "monthly") graphUnit = "month";
    if (unit == "yearly") graphUnit = "year";


    var options = {
      title: {
        text: 'Maternode Payouts'
      },
      scales: {
          xAxes: [{
              type: 'time',
              time: {
                  unit: graphUnit
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
  addresses: PropTypes.array.isRequired,
  payOutType: PropTypes.string.isRequired
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
                x: current,
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
        x: date,
        y: value == "sum" ? stat.value : stat.count
    });

    lastDate = date;
  }

  return data;
}