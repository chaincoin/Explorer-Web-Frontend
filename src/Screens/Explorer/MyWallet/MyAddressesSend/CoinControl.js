import React from 'react';

import bigDecimal from 'js-big-decimal';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Checkbox from '@material-ui/core/Checkbox';
import { nullLiteral } from '@babel/types';




const styles = {
  
};

class CoinControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  
  }


  renderAddressCoinControl = (controlledAddress) =>
  {
    const { classes } = this.props;

    var allSelected = controlledAddress.inputs.find(input => input.selected != true) == null;

    const handleInputChange = (input) =>{
      return (event) =>{
        this.props.handleInputsSelectedChange([input], event.target.checked);
      }
    }


    const handleControlledAddressChange = (event) =>{

      
      this.props.handleInputsSelectedChange(controlledAddress.inputs, event.target.checked);
    }

    

    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Checkbox
            checked={allSelected}
            onClick={(e)=> e.stopPropagation()}
            onChange={handleControlledAddressChange}
            color="primary"
          />
        {controlledAddress.controlledAddress.name} {controlledAddress.address.balance}
        
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Confirmations</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {controlledAddress.inputs.map(input => (
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={input.selected}
                      onChange={handleInputChange(input)}
                      disabled={(input.inMemPool || input.inMnList)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{input.unspent.value}</TableCell>
                  <TableCell>{TimeToString(input.unspent.time)}</TableCell>
                  <TableCell>{input.confirmations}</TableCell>
                  <TableCell>{input.inMemPool ? "In MemPool, " : null}{ input.inMnList ? "In MN List, " : nullLiteral} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }


  render(){
    const { classes, controlledAddresses } = this.props;

    var selectedInputsTotal = new bigDecimal('0');
    controlledAddresses.forEach(controlledAddress => controlledAddress.inputs.forEach(input =>{
      if (input.selected) selectedInputsTotal = selectedInputsTotal.add(input.value);
    }));

    
    return (
      <div>
        {controlledAddresses.map(this.renderAddressCoinControl)}
        <div>
          Input Total: { selectedInputsTotal.getValue() }
        </div>
      </div>
    );
  }
}



CoinControl.propTypes = {
  classes: PropTypes.object.isRequired,
  controlledAddresses: PropTypes.object.isRequired,
  selectedInputs: PropTypes.object.isRequired, 
};

export default withStyles(styles)(CoinControl);



var TimeToString = (timestamp) =>{ //TODO: make this an include
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}
