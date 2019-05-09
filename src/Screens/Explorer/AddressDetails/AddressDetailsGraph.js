import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardBody, CardHeader } from 'reactstrap';
import Graph from '../../../Components/PayOutGraph';
import Paper from '@material-ui/core/Paper';

const styles = {
  root: {
    
  },
  paper:{
    padding:"10px"
  }
};

class AddressDetailsGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render(){
    const { classes, address } = this.props;

    var names = [];
    var addresses = [];
    if (address != null) {
      names.push("");
      addresses.push(address.address);
    }

    return (
      <Paper className={classes.paper}>
      {
        address != null ? 
        <Graph names={names} addresses={addresses} payOutType="miner" /> :
        ""
      }
      </Paper>
      
    );
  }

  
}



AddressDetailsGraph.propTypes = {
  classes: PropTypes.object.isRequired,
  address: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddressDetailsGraph);



