import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import Grid from '@material-ui/core/Grid';

import AddressMenu from '../../../Components/AddressMenu'

const styles = {
  root: {
    
  },
  menuButton:{
    float:"right"
  }
};

class AddressDetailsHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  
  }



  render(){
    const { classes, address } = this.props;
    return (
    <div>
      <Card>
        <CardHeader>
        Address: {address.address}
        <div className={classes.menuButton}>
          <AddressMenu address={address.address} hideViewAddress={true} />
        </div>
        </CardHeader>
        <CardBody>
          <Grid container spacing={24}>
            <Grid item xs={12} sm={4}>
              <div>
                Total Sent (CHC)
              </div>
              <div>
                {address.sent}
              </div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <div>
              Total Received (CHC)
              </div>
              <div>
                {address.received}
              </div>
            </Grid>

            <Grid item xs={12} sm={4}>
              <div>
              Balance (CHC)
              </div>
              <div>
                {address.balance}
              </div>
            </Grid>
            
          </Grid>

        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}



AddressDetailsHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  address: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddressDetailsHeader);




