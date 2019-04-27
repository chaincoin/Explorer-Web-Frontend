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

    this.state = {
      blockCount: null
    };

  }

  componentDidMount() {

    this.blockCountSubscription = BlockchainServices.BlockCount.subscribe((blockCount) =>{
      this.setState({
        blockCount: blockCount
      });

    });
 
  }

  componentWillUnmount() {
    this.blockCountSubscription.unsubscribe();
  }


  render(){
    const { classes } = this.props;
    return (
    <div>
      <Card>
        <CardHeader>
          Block Count
        </CardHeader>
        <CardBody>
          <CardText>
          { this.state.blockCount != null ?
            this.state.blockCount :
            "Loading"
          }
          </CardText>
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