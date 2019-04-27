import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import Grid from '@material-ui/core/Grid';
import { Link } from "react-router-dom";

const styles = {
  root: {
    
  }
};

class BlockDetailsHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  
  }



  render(){
    const { classes, transaction } = this.props;
    return (
    <div>
      <Card>
        <CardHeader>
        CHC Transaction: {transaction.blockhash}
        </CardHeader>
        <CardBody>
          <Grid container spacing={24}>
            <Grid item lg={2}>
              <div>
                Confirmations
              </div>
              <div>
                {transaction.confirmations}
              </div>
            </Grid>
            <Grid item lg={7}>
              <div>
                Block Hash
              </div>
              <div>
              <Link to={"/Explorer/Block/" + transaction.height}>{transaction.blockhash}</Link>
              </div>
            </Grid>

            <Grid item lg={2}>
              <div>
                Timestamp
              </div>
              <div>
                {TimeToString(transaction.time)}
              </div>
            </Grid>

            
            
          </Grid>

        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}

BlockDetailsHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  transaction: PropTypes.object.isRequired,
};

export default withStyles(styles)(BlockDetailsHeader);




var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}