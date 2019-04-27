import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import BlockchainServices from '../../Services/BlockchainServices';

const styles = {
  root: {
    
  }
};

class CoinSupply extends React.Component {
  constructor(props) {
    super(props);

    this.txOutSetInfoSubscription = null;

    this.state = {
      txOutSetInfo: null
    };

  }

  componentDidMount() {

    this.txOutSetInfoSubscription = BlockchainServices.txOutSetInfo.subscribe((txOutSetInfo) =>{
      this.setState({
        txOutSetInfo: txOutSetInfo
      });

    });
 
  }

  componentWillUnmount() {
    this.txOutSetInfoSubscription.unsubscribe();
  }




  render(){
    const { classes } = this.props;
    const {txOutSetInfo} = this.state;
    return (
    <div>
      <Card>
        <CardHeader>
        Coin Supply (CHC)
        </CardHeader>
        <CardBody>
          <CardText>
          {
            txOutSetInfo == null?
            "Loading" :
            txOutSetInfo.total_amount
          }
          </CardText>
        </CardBody>
      </Card>
    </div>
      
    );
  }

  
}

CoinSupply.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CoinSupply);