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
        Contact Me (Mcna)
        </CardHeader>
        <CardBody>
          <CardText>
          Email: mcna@chaincoin.org <br/>
          Discord: Mcna#7135 <br/>
          Donations CHC: CbJDKG69GHPkKXEi81xPToqM3NH7P8ckZ6 <br/>
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