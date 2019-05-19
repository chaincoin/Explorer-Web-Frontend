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

import Switch from '@material-ui/core/Switch';

import { ValidatorForm, SelectValidator} from 'react-material-ui-form-validator';
import Recipients from './Recipients';
import CoinControl from './CoinControl';

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
      sending:false,
      myAddresses:[],
      controlledAddresses:[],


      lockedInputs:{},
      recipients:[],


      feePerByte: 10,

      coinControl:false,
      coinControlInputTotal:0,

      changeAddress:"",

      transactionFee: 0,
      transactionInputs: null,
      transactionOutputs: null,

    };
  
    this.selectedInputs = new BehaviorSubject({});
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
      this.getUnspent(),
    ).subscribe(([myAddresses,controlledAddresses]) =>{     

      this.setState({
        myAddresses,
        controlledAddresses, 
      },this.processTransaction);

    })
  }

  getUnspent = () =>{
    return combineLatest(MyWalletServices.myAddresses, BlockchainServices.blockCount,  BlockchainServices.rawMemPool,BlockchainServices.masternodeList, this.selectedInputs)
      .pipe(
      mergeMap(([myAddresses,blockCount, rawMemPool, masternodeList, selectedInputs]) => combineLatest(
        myAddresses.filter(myAddress => myAddress.WIF != null).map(controlledAddress => 
          combineLatest(
            BlockchainServices.getAddress(controlledAddress.address),
            BlockchainServices.getAddressUnspent(controlledAddress.address)
          )
          .pipe(
            map(([address,unspent]) =>{
              return {
                controlledAddress,
                address: address,
                inputs: unspent.map(unspent => {
                  var value = new bigDecimal(unspent.value)
                  return {
                    unspent: unspent,
                    value: value,
                    satoshi: value.multiply(new bigDecimal("100000000")),
                    confirmations: blockCount - unspent.blockHeight,
                    selected: selectedInputs[unspent.txid + "-" + unspent.vout] != null,
                    lockState: null,
                    inMemPool: rawMemPool.find(r => r.vin.find(v => v.txid == unspent.txid && v.vout == unspent.vout )),
                    inMnList: Object.keys(masternodeList).find(output => output == unspent.txid + "-" + unspent.vout)
                  }
                })
              }
            })
          )
        )
      ))
    );
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleRecipientsChange = (recipients) =>{
    this.setState({
      recipients
    }, this.processTransaction);
  }
  

  processTransaction = () =>{
    var recipientsTotal = 0;

    this.state.recipients.forEach(r =>{
      var amount = parseFloat(r.amount);
      if (isNaN(amount) == false) recipientsTotal = recipientsTotal + (amount * 100000000); //TODO: floating point issue
    });


    var targets = this.state.recipients.map(r =>{
      return  {
        address: r.address,
        value: parseInt(new bigDecimal(r.amount).multiply(new bigDecimal("100000000")).getValue())
      };
    })


    if (this.state.coinControl)
    {

      var coinControlInputTotal = new bigDecimal("0");
      var utxos = [];
      this.state.controlledAddresses.forEach(controlledAddress => {
        controlledAddress.inputs.forEach(input =>{
          if (input.selected == false) return;
          coinControlInputTotal = coinControlInputTotal.add(input.satoshi); 
          utxos.push({
            txId: input.unspent.txid,
            vout: input.unspent.vout,
            value: parseInt(input.satoshi.getValue()),
            data: controlledAddress
          });
        })
        
      });


      
     

      let { inputs, outputs, fee } = coinSelectUtils.finalize(utxos, targets, this.state.feePerByte);

      this.setState({
        coinControlInputTotal: coinControlInputTotal,

        transactionFee: fee,
        transactionInputs: inputs,
        transactionOutputs: outputs,
        transactionChange: outputs == null ? null : outputs.find(o => o.address == null)
      });

    }
    else
    {
      const utxos = this.state.controlledAddresses.flatMap(controlledAddress => controlledAddress.inputs.map(input => {
        return {
          txId: input.unspent.txid,
          vout: input.unspent.vout,
          value: parseInt(input.satoshi.getValue()),
          data: controlledAddress
        };
      }));
  
      ;
  
      let { inputs, outputs, fee } = coinSelect(utxos, targets, this.state.feePerByte);
  
  
      this.setState({
        transactionFee: fee,
        transactionInputs: inputs,
        transactionOutputs: outputs,
        transactionChange: outputs == null ? null : outputs.find(o => o.address == null)
      });
    }
  }



  handleSendClick = (event) =>{

    

    this.setState({
      sending:true
    });
    
    this.refs.form.isFormValid(false).then(valid =>{
      if (valid) this.SendTransaction();
      else {
        this.setState({
          sending:false
        });
      }
    })
  }


  SendTransaction = () =>{
    const { transactionInputs, transactionOutputs, changeAddress } = this.state;

    if (window.confirm("Are you sure?") != true) return;

    if (transactionInputs == null || transactionOutputs == null) {
      alert("invalid transaction - please check details");
      return;
    } 

    let txb = new window.bitcoin.TransactionBuilder(BlockchainServices.Chaincoin);
    txb.setVersion(3);
    transactionInputs.forEach(input => {
      if (input.data.controlledAddress.address.startsWith(BlockchainServices.Chaincoin.bech32))
      {
        var keyPair = window.bitcoin.ECPair.fromWIF(input.data.controlledAddress.WIF, BlockchainServices.Chaincoin);
        const p2wpkh = window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin })
        txb.addInput(input.txId, input.vout, null, p2wpkh.output); 
      }
      else
      {
        txb.addInput(input.txId, input.vout);
      }
      
      
    });

    transactionOutputs.forEach(output => {
      // watch out, outputs may have been added that you need to provide
      // an output address/script for
      if (!output.address) {
        output.address = changeAddress.address
      }

      txb.addOutput(output.address, output.value)
    });

    transactionInputs.forEach((input,i) => {

      var keyPair = window.bitcoin.ECPair.fromWIF(input.data.controlledAddress.WIF, BlockchainServices.Chaincoin);
      
      if (input.data.controlledAddress.address.startsWith(BlockchainServices.Chaincoin.bech32))
      {
        txb.sign(i, keyPair,null, null,input.value);
      }
      else
      {
        txb.sign(i, keyPair);
      }
      
    });

    var transaction = txb.build();
    var hex = transaction.toHex();


    BlockchainServices.sendRawTransaction(hex, true).then(() =>{
      alert("Transaction successful");
    }).catch(() =>{
      alert("Transaction failed");
    });

  }


  

  handleChangeChangeAddress = (event) =>{
    this.setState({
      changeAddress: event.target.value
    });
  }

  handleClearClick = () =>{
    //this.coinControl.clear();
    this.recipients.clear();
  }

  handleCoinControlChange = (event ) =>{
    this.setState({
      coinControl : event.target.checked
    }, this.processTransaction);
  }



  render(){
    const { classes } = this.props;
    const { coinControl, controlledAddresses, selectedInputs,  feePerByte, transactionFee, transactionChange, changeAddress, myAddresses} = this.state;

    var balance = 0;
    controlledAddresses.forEach(controlledAddress =>{
      if (controlledAddress.unspent != null) controlledAddress.unspent.forEach(unspent => balance = balance + unspent.value);
    })
    
    return (
      <Paper className={classes.paper}>
        <ValidatorForm
          ref="form"
          onSubmit={this.handleSendClick}
          onError={errors => console.log(errors)}
        >
        Coin Control: 
        <Switch
          checked={coinControl}
          onChange={this.handleCoinControlChange}
          color="primary"
        />
          {
            coinControl == true?
            (
              <CoinControl controlledAddresses={controlledAddresses} selectedInputs={selectedInputs} handleInputsSelectedChange={this.handleInputsSelectedChange}/>
            )
            :
            null
          }


          <Recipients onRef={recipients => this.recipients = recipients} recipientsChange={this.handleRecipientsChange}/>
          
          
          <Grid container spacing={24}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <SelectValidator
                  label="Change Address"
                  value={changeAddress}
                  onChange={this.handleChangeChangeAddress}
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
          <div>
            Fee Per KB {(feePerByte * 1024) / 100000000}  
          </div>
          <div>
            Transaction Fee {transactionFee / 100000000}  
          </div>
          <div>
            Change {transactionChange == null ? 0 : transactionChange.value / 100000000} 
          </div>

          <div>
            Balance {balance} 
          </div>
          
          <Button variant="contained" color="primary" onClick={this.handleSendClick}>Send</Button>
          <Button variant="contained" color="secondary" onClick={this.handleClearClick}>Clear</Button>
        </ValidatorForm>
      </Paper>
      
    );
  }
}



MyAddressesSend.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAddressesSend);



