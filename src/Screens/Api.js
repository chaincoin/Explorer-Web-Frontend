import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';


const styles = {
  root: {
    "display": "table",
    "margin": "0 auto"
  }
};

class ContactMe extends React.Component {
  constructor(props) {
    super(props);

  
  }



  render(){
    const { classes } = this.props;
    return (
    <div className={classes.root}>
      <Card>
        <CardHeader>
        API
        </CardHeader>
        <CardBody>
          <CardText>
          Api details coming soon <br/>
          There are examples of the Api usage throughout this site
          </CardText>
        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}

ContactMe.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContactMe);