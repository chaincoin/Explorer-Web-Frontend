import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import BlockchainServices from '../../Services/BlockchainServices';

const styles = {
  root: {
    
  }
};

class Network extends React.Component {
  constructor(props) {
    super(props);

  
    this.networkHashpsSubscription = null;

    this.state = {
      networkHashps: null
    };

  }

  componentDidMount() {

    this.networkHashpsSubscription = BlockchainServices.networkHashps.subscribe((networkHashps) =>{
      this.setState({
        networkHashps: networkHashps
      });

    });
 
  }

  componentWillUnmount() {
    this.networkHashpsSubscription.unsubscribe();
  }



  render(){
    const { classes } = this.props;
    const {networkHashps} = this.state;
    return (
    <div>
      <Card>
        <CardHeader>
          Network
        </CardHeader>
        <CardBody>
          <CardText>
          {
            networkHashps == null?
            "Loading" :
            hashpsToString(networkHashps)
          }
          </CardText>
        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}

Network.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Network);




var hashpsToString = (hashps) =>
{
  if (hashps < 1000)
  {
      return (hashps).toFixed(2) + " H/s";
  }
  else if (hashps >= 1000 && hashps < 1000000)
  {
      return (hashps / 1000).toFixed(2) + " KH/s";
  }
  else if (hashps >= 1000000 && hashps < 1000000000)
  {
      return (hashps / 1000000).toFixed(2) + " MH/s";
  }
  else if (hashps >= 1000000000 && hashps < 1000000000000)
  {
      return (hashps / 1000000000).toFixed(2) + " GH/s";
  }
  else 
  {
      return (hashps / 1000000000000).toFixed(2) + " TH/s";
  }
}