import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import BlockchainServices from '../../Services/BlockchainServices';

const styles = {
  root: {
    
  }
};

class Masternodes extends React.Component {
  constructor(props) {
    super(props);

    this.masternodeCountSubscription = null;

    this.state = {
      masternodeCount: null
    };

  }

  componentDidMount() {

    this.masternodeCountSubscription = BlockchainServices.masternodeCount.subscribe((masternodeCount) =>{
      this.setState({
        masternodeCount: masternodeCount
      });

    });
 
  }

  componentWillUnmount() {
    this.masternodeCountSubscription.unsubscribe();
  }




  render(){
    const { classes } = this.props;
    const {masternodeCount} = this.state;
    return (
    <div>
      <Card>
        <CardHeader>
        Masternodes
        </CardHeader>
        <CardBody>
          <CardText>
          {
            masternodeCount == null?
            "Loading" :
            `Total: ${masternodeCount.total} / Enabled: ${masternodeCount.enabled}`
          }
          </CardText>
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