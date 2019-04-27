import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';


const styles = {
  root: {
    
  }
};

class Masternodes extends React.Component {
  constructor(props) {
    super(props);

  
  }



  render(){
    const { classes } = this.props;
    return (
    <div>
      <Card>
        <CardHeader>
        Masternodes
        </CardHeader>
        <CardBody>
          <CardText>Not Implemented</CardText>
        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}

Masternodes.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Masternodes);