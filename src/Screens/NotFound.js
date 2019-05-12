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

class NotFound extends React.Component {
  constructor(props) {
    super(props);

  
  }



  render(){
    const { classes } = this.props;
    const { searchInput } = this.props.match.params;
    
    return (
    <div className={classes.root}>
      <Card>
        <CardHeader>
        API
        </CardHeader>
        <CardBody>
          <CardText>
          Unable to find any entity within the blockchain with the id of {searchInput}
          </CardText>
        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}

NotFound.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NotFound);