import React from 'react';

import { combineLatest, from, of, throwError } from 'rxjs';
import { switchMap, map, first, withLatestFrom  } from 'rxjs/operators';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from "react-router-dom";

import secp256k1 from "secp256k1";

import MyMasternodeDialog from './Dialogs/MyMasternodeDialog'
import MyAddressDialog from './Dialogs/MyAddressDialog'

import BlockchainServices from '../Services/BlockchainServices';
import MyWalletServices from '../Services/MyWalletServices';
import FirebaseServices from '../Services/FirebaseServices';
import DialogService from '../Services/DialogService';



import Utils from 'Z:/Software/Chaincoin/Tools/Chaincoin Client/utils'

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


    var payeeToBufffer = (payee) =>{
      var buffer = Buffer.alloc(payee.length);
      for(var i = 0; i < payee.length; i++)
      {
        buffer[i] = payee.charCodeAt(i);
      }
      return buffer;
    }

    var addressKeyPair = window.bitcoin.ECPair.fromWIF(this.state.myAddress.WIF, BlockchainServices.Chaincoin);
    var mnKeyPair = window.bitcoin.ECPair.fromWIF(this.state.myMn.privateKey, BlockchainServices.Chaincoin);

    var masternode = BlockchainServices.masternode(this.state.myMn.output).pipe(
      switchMap(mn => mn != null? of(mn): throwError(new Error("Failed to find MN in masternode list")))
    );


    BlockchainServices.blockCount.
    pipe(
      switchMap(blockCount => BlockchainServices.getBlockHash(blockCount - 12)),
      withLatestFrom(masternode),
      first(),
      map(([blockHash, masternode]) =>{

        const colonPos = masternode.address.lastIndexOf(':');
        const address = masternode.address.substring(0,colonPos);
        const port = masternode.address.substring(colonPos + 1);

        return {
          masternodeOutPoint: this.state.myMn.output,
          addr: {address:address, port:parseInt(port)},
          payee: masternode.payee,
          pubKeyCollateralAddress:addressKeyPair.publicKey.toString("hex"),
          pubKeyMasternode:mnKeyPair.publicKey.toString("hex"),
          sig: null,
          sigTime: Math.floor(new Date().getTime() / 1000),
  
          nProtocolVersion: 70015,
          lastPing: {
            blockHash: blockHash,
            sigTime: Math.floor(new Date().getTime() / 1000),
            vchSig: null,
            fSentinelIsCurrent: true,
            nSentinelVersion: 66304,
            nDaemonVersion: 160400
          }
        }
      }),
      switchMap(masternodeBroadcastData => from(BlockchainServices.GenerateMasternodeBoardcastHashes(masternodeBroadcastData))
      .pipe(
          map(hashes =>{

            const masternodePingSig = secp256k1.sign(Buffer.from(hashes.masternodePingHash,"hex"), mnKeyPair.privateKey);
            const masternodeBroadcastSig = secp256k1.sign(Buffer.from(hashes.masternodeBroadcastHash,"hex"), addressKeyPair.privateKey);

            masternodeBroadcastData.lastPing.vchSig = Utils.encodeSignature(masternodePingSig.signature, masternodePingSig.recovery,mnKeyPair.compressed).toString("hex");
            masternodeBroadcastData.sig = Utils.encodeSignature(masternodeBroadcastSig.signature, masternodeBroadcastSig.recovery,addressKeyPair.compressed).toString("hex");

            return masternodeBroadcastData;
          })
        )
      ),
      switchMap(masternodeBroadcastData => from(BlockchainServices.SendMasternodeBoardcastHashes(masternodeBroadcastData)))
    )
    .subscribe((blockHash) =>{
      DialogService.showMessage("Success", "Masternode Start successfully broadcasted");
      this.handleMenuClose();
    },(error) =>{
      DialogService.showMessage("Failed", "Oh no, something went wrong :(");
      this.handleMenuClose();
    })    
  }
  
  handleMenuAddToMyMNs = () => {
    this.handleMenuClose();

    DialogService.showDialog(MyMasternodeDialog,{
      output: this.props.output
    });
  };

  handleMenuEditMyMn = () => {
    this.handleMenuClose();

    DialogService.showDialog(MyMasternodeDialog,{ output: this.props.output});

  };

  handleMenuRemoveFromMyMns = () => {
    this.handleMenuClose();

    DialogService.showConfirmation("Remove My Masternode", "Are you sure?")
    .subscribe((result) =>{

      if (result == true) MyWalletServices.deleteMyMasternode(this.props.output);
    });
  };

  handleMenuAddToMyAddresses = () => {
    this.handleMenuClose();
    
    DialogService.showDialog(MyAddressDialog,{
      address: this.props.payee
    });
  };

  handleMenuRemoveFromMyAddresses = () => {
    this.handleMenuClose();


    DialogService.showConfirmation("Remove My Address", "Are you sure?") //TODO: this could be smart and say if we have the private key stored for this address
    .subscribe((result) =>{

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
          {this.props.children}
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
            [<MenuItem onClick={this.handleMenuEditMyMn}>Edit My Masternodes</MenuItem>,
            <MenuItem onClick={this.handleMenuRemoveFromMyMns}>Remove from My Masternodes</MenuItem>]
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




