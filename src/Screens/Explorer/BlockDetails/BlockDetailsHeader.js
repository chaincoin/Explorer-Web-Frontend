import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';


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
          <CardText>Not Implemented</CardText>
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