import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import Grid from '@material-ui/core/Grid';


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
    const { classes, block } = this.props;
    return (
    <div>
      <Card>
        <CardHeader>
        CHC Block: {block.hash}
        </CardHeader>
        <CardBody>
          <Grid container spacing={24}>
            <Grid item xs={12} sm={4} lg={2}>
              <div>
                  Height
              </div>
              <div>
                {block.height}
              </div>
            </Grid>
            <Grid item xs={12} sm={4} lg={2}>
              <div>
                Difficulty
              </div>
              <div>
                {block.difficulty}
              </div>
            </Grid>

            <Grid item xs={12} sm={4} lg={2}>
              <div>
                Confirmations
              </div>
              <div>
                {block.confirmations}
              </div>
            </Grid>

            <Grid item xs={12} sm={4} lg={2}>
              <div>
                Size (kB)
              </div>
              <div>
                {block.size}
              </div>
            </Grid>

            <Grid item xs={12} sm={4} lg={2}>
              <div>
                Bits
              </div>
              <div>
                {block.bits}
              </div>
            </Grid>

            <Grid item xs={12} sm={4} lg={2}>
              <div>
                Nonce
              </div>
              <div>
                {block.nonce}
              </div>
            </Grid>

            <Grid item xs={12} sm={4} lg={2}>
              <div>
                Timestamp
              </div>
              <div>
                {block.time}
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
  block: PropTypes.object.isRequired,
};

export default withStyles(styles)(BlockDetailsHeader);