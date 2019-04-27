import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Header from './AddressDetailsHeader';
import Transactions from './AddressDetailsTransactions';

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


  componentDidMount() {
    const { addressId } = this.props.match.params

    this.getAddressSubscription = BlockchainServices.getAddress(addressId).subscribe((address) =>{
      this.setState({
        address: address
      });
    });

  }

  componentWillUnmount() {

    this.getAddressSubscription.unsubscribe();
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
    </div>
      
    );
  }

  
}

AddressDetails.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AddressDetails);