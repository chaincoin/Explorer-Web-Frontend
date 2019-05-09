import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Card, CardBody, CardHeader } from 'reactstrap';

import Header from './AddressDetailsHeader';
import Transactions from './AddressDetailsTransactions';
import Graph from './AddressDetailsGraph';



import BlockchainServices from '../../../Services/BlockchainServices';





const styles = {
  root: {
    
  }
};

class AddressDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        block: null,
        error: null,

        tab: 0,
    };
  
    this.getAddressSubscription = null;
  }

  addressSubscribe(){
    const { addressId } = this.props.match.params;

    if (this.getAddressSubscription != null) this.getAddressSubscription.unsubscribe();

    this.getAddressSubscription = BlockchainServices.getAddress(addressId).subscribe((address) =>{
      this.setState({
        address: address
      });
    });
  }

  handleTabChange = (event, tab) => {
    this.setState({ tab });
  };

  componentDidMount() {
    this.addressSubscribe();
  }

  componentWillUnmount() {
    this.getAddressSubscription.unsubscribe();
  }


  componentDidUpdate(prevProps) {
    if (this.props.match.params.addressId  != prevProps.match.params.addressId) this.addressSubscribe();
  }


  render(){
    const { classes } = this.props;
    const { address, tab } = this.state;

    if (address == null)
    {
      return null;
    }
    return (
    <div>
      <Header address={address}/>

      <Card>
        <CardHeader>
          <Tabs value={tab} onChange={this.handleTabChange}>
            <Tab label="Transactions" classes={{ label: 'details-tab' }} />
            <Tab label="Mining" classes={{ label: 'details-tab' }} />
            <Tab label="MN Payout" classes={{ label: 'details-tab' }} />
          </Tabs>
        </CardHeader>
        <CardBody>
        {tab === 0 && <Transactions address={address}/>}
        {tab === 1 && <Graph address={address} payOutType="miner" />}
        {tab === 2 && <Graph address={address} payOutType="masternode" />}
        </CardBody> 
      </Card>


      
      
    </div>
      
    );
  }

  
}

AddressDetails.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AddressDetails);