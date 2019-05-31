import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';


import Header from './TransactionDetailsHeader';
import Vin from './TransactionDetailsVin';
import Vout from './TransactionDetailsVout';


import BlockchainServices from '../../../Services/BlockchainServices';



const styles = {
  root: {
    
  }
};

class TransactionDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        transaction: null,
        error: null
    };
  
    this.getTransactionSubscription = null;
  }


  componentDidMount() {
    const { txid } = this.props.match.params

    this.getTransactionSubscription = BlockchainServices.getTransaction(txid).subscribe((transaction) =>{
      this.setState({
        transaction: transaction
      });
    });

  }

  componentWillUnmount() {

    this.getTransactionSubscription.unsubscribe();
  }



  render(){
    const { classes } = this.props;
    const { transaction } = this.state;

    if (transaction == null)
    {
      return null;
    }
    return (
    <div>
      <Header transaction={transaction}/>
      <Grid container>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <Vin transaction={transaction}/> 
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <Vout transaction={transaction}/> 
        </Grid>
      </Grid>
      
      
    </div>
      
    );
  }

  
}

TransactionDetails.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TransactionDetails);