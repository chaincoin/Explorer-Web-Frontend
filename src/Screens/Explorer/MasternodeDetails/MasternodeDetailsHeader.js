import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import Grid from '@material-ui/core/Grid';


const styles = {
  root: {
    
  }
};

class MasternodeDetailsHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  
  }



  render(){
    const { classes, output, masternode } = this.props;
    return (
    <div>
      <Card>
        <CardHeader>
        Output: {output}
        </CardHeader>
        <CardBody>
          <Grid container spacing={24}>
            <Grid item xs={12} sm={4}>
              <div>
                Payee
              </div>
              <div>
                {masternode.payee}
              </div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <div>
              Status
              </div>
              <div>
                {masternode.status}
              </div>
            </Grid>

            <Grid item xs={12} sm={4}>
              <div>
              Address
              </div>
              <div>
                {masternode.address}
              </div>
            </Grid>

            <Grid item xs={12} sm={4}>
              <div>
              Active Seconds
              </div>
              <div>
                {masternode.activeseconds}
              </div>
            </Grid>


            <Grid item xs={12} sm={4}>
              <div>
              Last Seen
              </div>
              <div>
                {TimeToString(masternode.lastseen)}
              </div>
            </Grid>



            <Grid item xs={12} sm={4}>
              <div>
              Daemon Version
              </div>
              <div>
                {masternode.daemonversion}
              </div>
            </Grid>

            <Grid item xs={12} sm={4}>
              <div>
              Last Paid Block
              </div>
              <div>
                {masternode.lastpaidblock}
              </div>
            </Grid>


            <Grid item xs={12} sm={4}>
              <div>
              Last Paid Time
              </div>
              <div>
              {masternode.lastpaidtime != 0?
                TimeToString(masternode.lastpaidtime):
                "Never Paid"
                }
              </div>
            </Grid>


            <Grid item xs={12} sm={4}>
              <div>
              Sentinel Version
              </div>
              <div>
                {masternode.sentinelversion}
              </div>
            </Grid>

            <Grid item xs={12} sm={4}>
              <div>
              Sentinel State
              </div>
              <div>
                {masternode.sentinelstate}
              </div>
            </Grid>
            
          </Grid>

        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}



MasternodeDetailsHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  output: PropTypes.string.isRequired,
  masternode: PropTypes.object.isRequired,
};

export default withStyles(styles)(MasternodeDetailsHeader);




var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}

