import React from 'react';
import { BehaviorSubject } from 'rxjs';

import bigDecimal from 'js-big-decimal';

import { combineLatest, forkJoin } from 'rxjs';
import { mergeMap, map  } from 'rxjs/operators';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';



import { ValidatorForm, SelectValidator} from 'react-material-ui-form-validator';
import Recipients from './Recipients';
import CoinControl from './CoinControl';


import Transaction from '../../../../Classes/Transaction';

import BlockchainServices from '../../../../Services/BlockchainServices';
import MyWalletServices from '../../../../Services/MyWalletServices';

import coinSelect from '../../../../Scripts/coinselect/coinselect'; //https://github.com/bitcoinjs/coinselect
import coinSelectUtils from '../../../../Scripts/coinselect/utils'; //https://github.com/bitcoinjs/coinselect



const styles = {
  root: {
    
  },
  paper:{
    padding:"10px"
  },
  recipient:{
    "padding-bottom":"10px"
  },
  recipientAddress:{
    "width":"100%"
  },
  recipientAmount:{
    "width":"100%"
  },
  recipientDivider:{
    "margin-top":"10px",
    "background-color": "#27B463"
  },
  changeSelect:{
    "width" : "100%"
  }
};

class MyAddressesSend extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      myAddresses:[],
      transaction: new Transaction(),

      changeAddress: "",

      feePerByte: 0,
      fee: 0,
      change: 0,
    };
  

    this.subscription = null;
  }

  
  componentDidMount() {

    ValidatorForm.addValidationRule('isChaincoinAddress', (address) => {
      try {
        window.bitcoin.address.toOutputScript(address,BlockchainServices.Chaincoin)
        return true
      } catch (e) {
        return false
      }
    });


    this.subscription = combineLatest(
      MyWalletServices.myAddresses,
      this.state.transaction.changeAddress,
      this.state.transaction.feePerByte,
      this.state.transaction.fee,
      this.state.transaction.change,
    ).subscribe(([myAddresses,changeAddress, feePerByte, fee, change]) =>{     

      this.setState({
        myAddresses,
        changeAddress,
        feePerByte,
        fee,
        change
      });

    })
  }

  
  componentWillUnmount() {
    this.subscription.unsubscribe();
  }
  

 
  handleSendClick = () =>{
    this.refs.form.isFormValid(false).then(valid =>{
      if (valid) this.state.transaction.send().then(() =>{
        alert("Transaction succesful");
        this.state.transaction.clear();
      })
      .catch(() =>{
        alert("Transaction failed");
      })
      
    });
  }



  render(){
    const { classes } = this.props;
    const { myAddresses, transaction, feePerByte, fee, change, changeAddress } = this.state;


    var changeAddresValue = myAddresses.find(myAddress => myAddress.address == changeAddress);
    if (changeAddresValue == null) changeAddresValue = "";
   
    return (
      <Paper className={classes.paper}>
        <ValidatorForm
          ref="form"
          onSubmit={this.handleSendClick}
          onError={errors => console.log(errors)}
        >
        
          <CoinControl transaction={transaction}/>

          <Recipients transaction={transaction}/>
          
          <Grid container spacing={24}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <SelectValidator
                  label="Change Address"
                  value={changeAddresValue}
                  onChange={(e) => transaction.setChangeAddress(e.target.value.address != null ? e.target.value.address : "")}
                  name="change-address"
                  className={classes.changeSelect}
                  validators={['required']}
                  errorMessages={['Change address required']}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>

                  {
                    myAddresses.map(myAddress =>(
                      <MenuItem value={myAddress}>{myAddress.name}</MenuItem>
                    ))
                  }

                </SelectValidator>
              </Grid>
            </Grid>

        </ValidatorForm>

        <div>
          Fee Per KB {(feePerByte * 1024) / 100000000}  
        </div>
        <div>
          Transaction Fee {fee}  
        </div>
        <div>
          Change {change} 
        </div>

        <Button variant="contained" color="primary" onClick={this.handleSendClick}>Send</Button>
        <Button variant="contained" color="secondary" onClick={(e) => this.state.transaction.clear()}>Clear</Button>
      </Paper>
      
    );
  }
}



MyAddressesSend.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAddressesSend);



