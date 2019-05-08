import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

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
        error: null
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
    const { address } = this.state;

    if (address == null)
    {
      return null;
    }
    return (
    <div>
      <Header address={address}/>
      <Transactions address={address}/>
      <Graph address={address} />
    </div>
      
    );
  }

  
}

AddressDetails.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AddressDetails);