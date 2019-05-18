import React from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';


import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Checkbox from '@material-ui/core/Checkbox';


import { ValidatorForm, TextValidator, SelectValidator} from 'react-material-ui-form-validator';

import BlockchainServices from '../../../Services/BlockchainServices';
import MyWalletServices from '../../../Services/MyWalletServices';

import coinSelect from '../../../Scripts/coinselect/coinselect'; //https://github.com/bitcoinjs/coinselect
import coinSelectUtils from '../../../Scripts/coinselect/utils'; //https://github.com/bitcoinjs/coinselect

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
      recipients:[{
        address: "",
        amount: ""
      }],


      feePerByte: 10,

      coinControl:true,
      coinControlInputTotal:0,

      changeAddress:"",

      transactionFee: 0,
      transactionInputs: null,
      transactionOutputs: null,

    };
  
    this.myAddressesSubscription = null;
    this.addressUnspentSubscriptions = [];
  }

  
  handleAddRecipientClick = () =>{
    this.setState({
      recipients: this.state.recipients.concat([{
        address: "",
        amount: ""
      }])
    }, this.processTransaction);
  }


  processTransaction = () =>{

    var recipientsTotal = 0;
    var outputs = this.state.recipients.forEach(r =>{

      var amount = parseFloat(r.amount);
      if (isNaN(amount) == false) recipientsTotal = recipientsTotal + (amount * 100000000); //TODO: floating point issue
    });


    if (this.state.coinControl)
    {

      var coinControlInputTotal = 0;
      var utxos = [];
      this.state.controlledAddresses.forEach(controlledAddress => {
        if (controlledAddress.unspent == null) return;
        controlledAddress.unspent.forEach(unspent =>{
          if (unspent.selected == true){
            coinControlInputTotal = coinControlInputTotal + (unspent.value * 100000000); //TODO: floating point issue
            utxos.push({
              txId: unspent.txid,
              vout: unspent.vout,
              value: unspent.value * 100000000, //TODO: floating point issue
              myAddress: controlledAddress
            });
          } 
        })
      });


      var targets = this.state.recipients.map(r =>{
        return  {
          address: r.address,
          value: parseFloat(r.amount) * 100000000  //TODO: floating point issue
        };
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
      const utxos = this.state.controlledAddresses.flatMap(a => a.unspent.map(u => {
        return {
          txId: u.txid,
          vout: u.vout,
          value: u.value * 100000000, //TODO: floating point issue
          myAddress: a
        };
      }));
  
      var targets = this.state.recipients.map(r =>{
        return  {
          address: r.address,
          value: parseFloat(r.amount) * 100000000  //TODO: floating point issue
        };
      });
  
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

    if (transactionInputs == null || transactionOutputs == null) {
      alert("invalid transaction - please check details");
      return;
    } 

    let txb = new window.bitcoin.TransactionBuilder(BlockchainServices.Chaincoin);
    txb.setVersion(3);
    transactionInputs.forEach(input => {
      if (input.myAddress.address.startsWith(BlockchainServices.Chaincoin.bech32))
      {
        var keyPair = window.bitcoin.ECPair.fromWIF(input.myAddress.WIF, BlockchainServices.Chaincoin);
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

      var keyPair = window.bitcoin.ECPair.fromWIF(input.myAddress.WIF, BlockchainServices.Chaincoin);
      
      if (input.myAddress.address.startsWith(BlockchainServices.Chaincoin.bech32))
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


    BlockchainServices.sendRawTransaction(hex, true);

    const validateAddressPromises = transactionOutputs.map(output => BlockchainServices.validateAddress(output.address));

    Promise.all(validateAddressPromises).then((validateAddresses) =>{

           
     
    

    });
  }

  handleChangeChangeAddress = (event) =>{
    this.setState({
      changeAddress: event.target.value
    });
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

    this.myAddressesSubscription = MyWalletServices.myAddresses.subscribe(myAddresses =>{ //TODO: this could be done better

      const controlledAddresses = myAddresses.filter(a => a.WIF != null);
      this.addressUnspentSubscriptions.forEach(v => v.unsubscribe());

      this.setState({
        myAddresses: myAddresses,
        controlledAddresses: controlledAddresses 
      });

      this.addressUnspentSubscriptions = controlledAddresses.map((controlledAddress) => {
        return BlockchainServices.getAddressUnspent(controlledAddress.address).subscribe(unspent =>{
          controlledAddress.unspent = unspent;
          this.setState({
            controlledAddresses: controlledAddresses.slice()
          });
        });
      });
    });

  }

  componentWillUnmount() {
    this.myAddressesSubscription.unsubscribe();
    this.addressUnspentSubscriptions.forEach(v => v.unsubscribe());
  }


  renderRecipient = (recipient, pos) =>{
    const { classes } = this.props;
    const { recipients } = this.state;

    const handleAddressChange = (event) =>{
      recipient.address = event.target.value;
      this.setState({
        recipients: recipients.slice()
      });
    }

    const handleAmountChange = (event) =>{
      recipient.amount = event.target.value;
      this.setState({
        recipients: recipients.slice()
      }, this.processTransaction);
    }

    const handleRemoveClick = () =>{
      this.setState({
        recipients: recipients.filter(r => r != recipient)
      });
    }

    return (
      <div className={classes.recipient}>

        <Grid container spacing={24}>
          <Grid item xs={12} sm={12} md={6} lg={6}>
            <TextValidator
              label="Pay To"
              onChange={handleAddressChange}
              value={recipient.address}
              validators={['required', 'isChaincoinAddress']}
              errorMessages={['Address required',"Invalid address"]}
              className={classes.recipientAddress}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={4} lg={4}>
            <TextValidator
              label="Amount"
              onChange={handleAmountChange}
              value={recipient.amount}
              validators={['required', 'matchRegexp:^[0-9]\\d{0,9}(\\.\\d{0,8})?%?$']}
              errorMessages={['Amount required',"Invalid amount"]}
              className={classes.recipientAmount}
            />
          </Grid>
          {
            pos != 0 ?
            (
            <Grid item xs={12} sm={12} md={2} lg={1}>
              <Button variant="contained" color="secondary" onClick={handleRemoveClick}>Remove</Button>
            </Grid>
            )
            : null
          }
          
        </Grid>

      </div>
    );
  }

  renderAddressCoinControl = (controlledAddress) =>
  {

    var allSelected = true;
    if (controlledAddress.unspent != null)
    {
      controlledAddress.unspent.forEach(unspent => {
        if (unspent.selected != true) allSelected = false;
      });
    }
    else
    {
      allSelected = false;
    }
    

    const handleUnspentChange = (unspent) =>{
      return (event) =>{
        unspent.selected = event.target.checked;
        this.processTransaction();
      }
    }


    const handleControlledAddressChange = (event) =>{
      controlledAddress.unspent.forEach(unspent => unspent.selected = event.target.checked);
      this.processTransaction();
    }

    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Checkbox
            checked={allSelected}
            onClick={(e)=> e.stopPropagation()}
            onChange={handleControlledAddressChange}
            value="checkedB"
            color="primary"
          />
        {controlledAddress.name} {controlledAddress.data.balance}
        
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            {controlledAddress.unspent != null? controlledAddress.unspent.map(unspent => (
              <div>
                <div>
                  <Checkbox
                    checked={unspent.selected == true}
                    onChange={handleUnspentChange(unspent)}
                    value="checkedB"
                    color="primary"
                  />
                  {unspent.value}
                </div>
              </div>
            )): null}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }

  render(){
    const { classes } = this.props;
    const { coinControl, controlledAddresses, coinControlInputTotal, recipients, feePerByte, transactionFee, transactionChange, changeAddress, myAddresses} = this.state;

    
    return (
      <Paper className={classes.paper}>
        <ValidatorForm
          ref="form"
          onSubmit={this.handleSendClick}
          onError={errors => console.log(errors)}
        >

          {
            coinControl == true?
            (
              <div>
                {controlledAddresses.map(this.renderAddressCoinControl)}
                <div>
                  Input Total: {coinControlInputTotal / 100000000}
                </div>
              </div>
            )
            :
            null
          }


          {
            recipients.map(this.renderRecipient)
          }
          

          <div>
            <Button variant="contained" color="primary" onClick={this.handleAddRecipientClick}>Add Recipient</Button>
          </div>
          
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
          
          <Button variant="contained" color="primary" onClick={this.handleSendClick}>Send</Button>
        </ValidatorForm>
      </Paper>
      
    );
  }
}



MyAddressesSend.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAddressesSend);



