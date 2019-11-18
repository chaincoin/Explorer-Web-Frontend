import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';


import Header from './TransactionDetailsHeader';
import Vin from './TransactionDetailsVin';
import Vout from './TransactionDetailsVout';


import BlockchainServices from '../../../Services/BlockchainServices';
import { ReplaySubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';



const styles = {
  root: {
    
  }
};



const TransactionDetails = (props) =>{

  const [transaction, setTransaction] = React.useState();

   

  React.useEffect(() => {
    const subscription = BlockchainServices.getTransaction(props.match.params.txid).subscribe(transaction =>setTransaction(transaction));
    return () => subscription.unsubscribe();
  }, [props.match.params.txid]); 

  if (transaction == null) return (
    <div></div>
  ); //User promise or something

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
  )
}

TransactionDetails.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TransactionDetails);