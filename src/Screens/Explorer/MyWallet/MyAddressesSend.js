import React from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import Graph from '../../../Components/PayOutGraph';

import BlockchainServices from '../../../Services/BlockchainServices';
import MyWalletServices from '../../../Services/MyWalletServices';

const styles = {
  root: {
    
  },
  paper:{
    padding:"10px"
  }
};

class MyAddressesSend extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sending:false,
      myAddresses:[],
      recipients:[{
        address: "",
        amount: ""
      }]
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
    });
  }


  handleSendClick = () =>{

    this.setState({
      sending:true
    });
    const { recipients, controlledAddresses } = this.state;
    const validateAddressPromises = recipients.map(r => BlockchainServices.validateAddress(r.address));


    
    Promise.all(validateAddressPromises).then((validateAddresses) =>{
     debugger;
      

      
      
      const txb = new window.bitcoin.TransactionBuilder(BlockchainServices.Chaincoin);
      txb.setVersion(3);

      
      var transactionTotal = 0; //TODO: big decimal library
      recipients.forEach(r => {
        transactionTotal = transactionTotal + parseFloat(r.amount); //TODO: big decimal library

        const amount = parseFloat(r.amount); //TODO: big decimal library
        txb.addOutput(r.address, amount * 100000000);
      });


      var keyPairs = {};
      var p2wpkhs = {};
      var outputsTotal = 0;  //TODO: big decimal library
      const outputs = [];
      controlledAddresses.forEach(controlledAddress => {
        if (outputsTotal < transactionTotal)
        {
          controlledAddress.unspent.forEach(unspent =>{
            if (outputsTotal < transactionTotal) {
              outputsTotal = unspent.value;

              var keyPair = window.bitcoin.ECPair.fromWIF(controlledAddress.WIF, BlockchainServices.Chaincoin);
        
              const p2wpkh = window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin })

              txb.addInput(unspent.txid, unspent.vout, null, p2wpkh.output); 
              outputs.push({controlledAddress,unspent});
            }
          })
        }
      });


      outputs.forEach((o,i) => {

        var keyPair = window.bitcoin.ECPair.fromWIF(o.controlledAddress.WIF, BlockchainServices.Chaincoin);
        
        txb.sign(i, keyPair,null, null,o.unspent.value * 100000000);
      })

      
      var transaction = txb.build();
      var hex = transaction.toHex();

      

      BlockchainServices.sendRawTransaction(hex, true);
    

    });
  }

  componentDidMount() {

    this.myAddressesSubscription = MyWalletServices.myAddresses.subscribe(myAddresses =>{ //TODO: this could be done better

      const controlledAddresses = myAddresses.filter(a => a.WIF != null);
      this.addressUnspentSubscriptions.forEach(v => v.unsubscribe());

      this.setState({
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


  renderRecipient = (recipient) =>{
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
      });
    }

    const handleRemoveClick = () =>{
      this.setState({
        recipients: recipients.filter(r => r != recipient)
      });
    }

    return (
      <div>
        <TextField label="Pay To" value={recipient.address} onChange={handleAddressChange} />
        <TextField label="Amount" value={recipient.amount} onChange={handleAmountChange} />
        <Button variant="contained" color="secondary" onClick={handleRemoveClick}>Remove</Button>
      </div>
    );
  }

  render(){
    const { classes } = this.props;
    const { recipients } = this.state;

    

    return (
      <Paper className={classes.paper}>

        {
          recipients.map(this.renderRecipient)
        }
        <Button variant="contained" color="primary" onClick={this.handleAddRecipientClick}>Add Recipient</Button>
        <Button variant="contained" color="primary" onClick={this.handleSendClick}>Send</Button>
      </Paper>
      
    );
  }
}



MyAddressesSend.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAddressesSend);



