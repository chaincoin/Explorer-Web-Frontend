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

class MasternodeDetailsGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  
  }



  render(){
    const { classes, masternode } = this.props;

    var names = [];
    var addresses = [];
    if (masternode != null) {
      names.push("");
      addresses.push(masternode.payee);
    }

    return (
    <div>
      <Card>
        <CardHeader>
          Payout Graph
        </CardHeader>
        <CardBody>

          <Paper className={classes.paper}>
          {
            masternode != null ? 
            <Graph names={names} addresses={addresses} payOutType="masternode" /> :
            ""
          }
          </Paper>

        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}



MasternodeDetailsGraph.propTypes = {
  classes: PropTypes.object.isRequired,
  masternode: PropTypes.object.isRequired,
};

export default withStyles(styles)(MasternodeDetailsGraph);



