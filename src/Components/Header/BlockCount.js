import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';

import BlockchainServices from '../../Services/BlockchainServices';

const styles = {
  root: {
    
  }
};

class BlockCount extends React.Component {
  constructor(props) {
    super(props);

    this.blockCountSubscription = null;
  }

  componentDidMount() {

    this.blockCountSubscription = BlockchainServices.BlockCount.subscribe((blockCount) =>{
      console.log(blockCount);

    });

    

    BlockchainServices.BlockCount.subscribe((blockCount) =>{
      console.log(blockCount);

    });
    
    this.blockCountSubscription.unsubscribe();
  }

  componentWillUnmount() {
    
  }


  render(){
    const { classes } = this.props;
    return (
    <div>
      <Card>
        <CardHeader>
          Network
        </CardHeader>
        <CardBody>
          <CardText>Not Implemented</CardText>
        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}

BlockCount.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BlockCount);