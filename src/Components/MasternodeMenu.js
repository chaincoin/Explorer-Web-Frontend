import React from 'react';

import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from "react-router-dom";


import AddMyMasternodeDialog from './Dialogs/AddMyMasternodeDialog'
import WatchAddressDialog from './Dialogs/WatchAddressDialog'

import BlockchainServices from '../Services/BlockchainServices';
import MyWalletServices from '../Services/MyWalletServices';
import FirebaseServices from '../Services/FirebaseServices';
import DialogService from '../Services/DialogService';

import MasternodeBroadcastMessage from 'Z:\\Software\\Chaincoin\\Tools\\Chaincoin Client\\Messages\\MasternodeBroadcastMessage';
import MasternodePingMessage from 'Z:\\Software\\Chaincoin\\Tools\\Chaincoin Client\\Messages\\MasternodePingMessage';
import { first } from 'rxjs/operators';

const styles = theme => ({
  root: {
  }
});

class MasternodeMenu extends React.Component {
  state = {
    menuAnchorEl: null,
    myMn: null,
    mnAddress: true,
    addMasternodeSubscription:true
  };

  subscription = null
 

  handleMenuClick = (event) =>{

    const currentTarget = event.currentTarget;

    this.subscription = combineLatest(MyWalletServices.myMasternodes, MyWalletServices.myAddresses, FirebaseServices.MasternodeNotification(this.props.output)).subscribe(
      ([myMasternodes, myAddresses, masternodeSubscription]) =>{

        var myMn = null;
        if (myMasternodes != null)
        {
          myMn = myMasternodes.find(myMn =>myMn.output == this.props.output);
        }
        
        var myAddress = null;
        if (myAddresses != null)
        {
          myAddress = myAddresses.find(myAddress => myAddress.address == this.props.payee);
        }
        

        this.setState({
          menuAnchorEl: currentTarget,
          myMn: myMn,
          myAddress: myAddress,
          addMasternodeSubscription: masternodeSubscription == false
        });
    });
    

  };

  handleMenuClose = () => {
    if (this.subscription != null) this.subscription.unsubscribe();
    this.setState({ menuAnchorEl: null });
  };


  handleMenuStartMasternode = () =>{
    debugger;

    var payeeToBufffer = (payee) =>{
      var buffer = Buffer.alloc(payee.length);
      for(var i = 0; i < payee.length; i++)
      {
        buffer[i] = payee.charCodeAt(i);
      }
      return buffer;
    }

    BlockchainServices.blockCount.
    pipe(
      switchMap(blockCount => BlockchainServices.getBlockHash(blockCount - 12)),
      first()
    )
    .subscribe((blockHash) =>{
debugger;
      var addressKeyPair = window.bitcoin.ECPair.fromWIF(this.state.myAddress.WIF, BlockchainServices.Chaincoin);
      var mnKeyPair = window.bitcoin.ECPair.fromWIF(this.state.myMn.privateKey, BlockchainServices.Chaincoin);

      var output = this.state.myMn.output.split("-");


      var masternodeOutput = {txid: Buffer.from([...Buffer.from(output[0],"hex")].reverse()),vout: parseInt(output[1])};

      var masternodePing = new MasternodePingMessage(
        masternodeOutput,
        Buffer.from([...Buffer.from(blockHash,"hex")].reverse()),
        window.BigInt(Math.floor(new Date().getTime() / 1000)),
        null,
        true,
        66304,
        160400
      );

      masternodePing.sign(mnKeyPair);

      var masternodeBroadcast = new MasternodeBroadcastMessage(
        masternodeOutput,
        {address:"[2a01:4f9:2b:20af:0:0:5:2]", port:11994},
        payeeToBufffer("CV55x9mMa8tFDkTD3ykzn569G99znMqSHX"),
        addressKeyPair.publicKey,
        mnKeyPair.publicKey,
        null,
        window.BigInt(Math.floor(new Date().getTime() / 1000)),
        70015,
        masternodePing
      );

      masternodeBroadcast.sign(addressKeyPair);
debugger;
    })


    

    
  }
  
  handleMenuAddToMyMNs = () => {
    this.handleMenuClose();

    DialogService.showDialog(AddMyMasternodeDialog,{
      output: this.props.output
    });
  };

  handleMenuRemoveFromMyMns = () => {
    this.handleMenuClose();

    DialogService.showConfirmation("Remove My Masternode", "Are you sure?")
    .subscribe((result) =>{
      debugger;
      if (result == true) MyWalletServices.deleteMyMasternode(this.props.output);
    });
  };

  handleMenuAddToMyAddresses = () => {
    this.handleMenuClose();
    
    DialogService.showDialog(WatchAddressDialog,{
      address: this.props.payee
    });
  };

  handleMenuRemoveFromMyAddresses = () => {
    this.handleMenuClose();


    DialogService.showConfirmation("Remove My Address", "Are you sure?") //TODO: this could be smart and say if we have the private key stored for this address
    .subscribe((result) =>{
      debugger;
      if (result == true) MyWalletServices.deleteMyAddress(this.props.payee);
    });
  };


  handleMenuAddMasternodeSubscription = () => {
    this.handleMenuClose();

    if (FirebaseServices.supported == false)
    {
      DialogService.showMessage("Failed", "Your browser doesnt support Push Notifications, please try Chrome or Firefox");
      return;
    }

    FirebaseServices.saveMasternodeNotification(this.props.output).subscribe(); //TODO: handle error
  };

  handleMenuRemoveMasternodeSubscription = () => {
    this.handleMenuClose();

    FirebaseServices.deleteMasternodeNotification(this.props.output).subscribe(); //TODO: handle error
  };

  componentDidMount() {

  }

  componentWillUnmount = () => {
    if (this.subscription != null) this.subscription.unsubscribe();
  }





 
  render() {
    const { classes, payee, output, hideViewMasternode } = this.props;
    const { menuAnchorEl, myMn, myAddress, addMasternodeSubscription } = this.state;

    

    return (
      <div className={classes.root}>
        <Button variant="contained" color="primary" aria-owns={menuAnchorEl ? 'simple-menu' : undefined} aria-haspopup="true" onClick={this.handleMenuClick}>
          Menu
        </Button>
        <Menu id="simple-menu" anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={this.handleMenuClose} >
          {
            hideViewMasternode == true ?
            "" :
            <Link to={"/Explorer/MasternodeList/" + output}>
              <MenuItem  onClick={this.handleMenuClose}>View Masternode</MenuItem>
            </Link>
          }
          
          <Link to={"/Explorer/Address/" + payee}>
            <MenuItem  onClick={this.handleMenuClose}>View Address</MenuItem>
          </Link>
          {
            myMn != null && myMn.privateKey != null && myAddress != null && myAddress.WIF != null && myAddress.WIF != ""?
            <MenuItem onClick={this.handleMenuStartMasternode}>Start Masternode</MenuItem> :
            null
          }
          {
            myMn == null?
            <MenuItem onClick={this.handleMenuAddToMyMNs}>Add to My Masternodes</MenuItem> :
            <MenuItem onClick={this.handleMenuRemoveFromMyMns}>Remove from My Masternodes</MenuItem>
          }
          {
            myAddress == null?
            <MenuItem onClick={this.handleMenuAddToMyAddresses}>Add to My Addresses</MenuItem> :
            <MenuItem onClick={this.handleMenuRemoveFromMyAddresses}>Remove from My Addresses</MenuItem>
          }
          {
            addMasternodeSubscription == true?
            <MenuItem onClick={this.handleMenuAddMasternodeSubscription}>Add Masternode Subscription</MenuItem> :
            <MenuItem onClick={this.handleMenuRemoveMasternodeSubscription}>Remove Masternode Subscription</MenuItem>
          }
          {this.props.children}
        </Menu>
      </div>
      
    );
  }
}


MasternodeMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  output: PropTypes.string.isRequired,
  payee: PropTypes.string.isRequired,
};
export default withStyles(styles)(MasternodeMenu);




