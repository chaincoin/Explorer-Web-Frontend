import React from 'react';

import { combineLatest, from, of, throwError, empty } from 'rxjs';
import { switchMap, map, first, withLatestFrom, filter  } from 'rxjs/operators';

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
import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import FirebaseServices from '../Services/FirebaseServices';
import DialogService from '../Services/DialogService';



import Utils from 'Z:/Software/Chaincoin/Tools/Chaincoin Client/utils'
import DecryptPrivateKeyObservable from '../Observables/DecryptPrivateKeyObservable';
import GetWalletPasswordObservable from '../Observables/GetWalletPasswordObservable';
import EncryptPrivateKeyObservable from '../Observables/EncryptPrivateKeyObservable';
import GetMasternodePrivateKeyObservable from '../Observables/GetMasternodePrivateKeyObservable';
import IsWalletEncryptedObservable from '../Observables/IsWalletEncryptedObservable';

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


  handleMenuStartMasternode = () =>{ //TODO: move this logic to wallet service

    DialogService.showConfirmation("Start Masternode", "Are you sure you want to broadcast start masternode message").subscribe(result =>{
      if (result == false) return;

      IsWalletEncryptedObservable.pipe(
        switchMap(walletEncrypted => walletEncrypted == false ? 
          of(""):
          GetWalletPasswordObservable
        )
      ).subscribe((walletPassword) =>{      

        if (walletPassword == null) return;

        var addressKeyPair = window.bitcoin.ECPair.fromWIF(walletPassword == "" ? this.state.myAddress.WIF : MyWalletServices.decrypt(walletPassword,this.state.myAddress.encryptedWIF), BlockchainServices.Chaincoin);
        var mnKeyPair = window.bitcoin.ECPair.fromWIF(walletPassword == "" ? this.state.myMn.privateKey : MyWalletServices.decrypt(walletPassword,this.state.myMn.encryptedPrivateKey), BlockchainServices.Chaincoin);
    
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
          DialogService.showMessage("Success", "Masternode Start successfully broadcasted").subscribe();
        },(error) =>{
          DialogService.showMessage("Failed", "Oh no, something went wrong :(").subscribe();
        });    
      });
      

    });
    this.handleMenuClose();
    
  }
  
  handleMenuAddToMyMNs = () => {
    this.handleMenuClose();

    DialogService.showDialog(MyMasternodeDialog,{
      output: this.props.output
    }).subscribe();
  };

  handleMenuEditMyMn = () => {
    this.handleMenuClose();

    DialogService.showDialog(MyMasternodeDialog,{ output: this.props.output}).subscribe();

  };

  handleExportPrivateKey = () =>{
    this.handleMenuClose();


    IsWalletEncryptedObservable.pipe(
      switchMap(walletEncrypted => walletEncrypted ? 
        DecryptPrivateKeyObservable(this.state.myMn.encryptedPrivateKey):
        of(this.state.myMn.privateKey)
      ),
      first(),
    ).subscribe((WIF)=>{
      if (WIF != null) DialogService.showMessage("WIF", WIF).subscribe();
    },
    (error) =>{
      DialogService.showMessage("Error",error).subscribe();
    });
  }

  handleClearPrivateKey = () =>{
    this.handleMenuClose();


    IsWalletEncryptedObservable.pipe(
      switchMap(walletEncrypted => walletEncrypted == false ? of(""): GetWalletPasswordObservable),
      switchMap((walletPassword) => walletPassword == null ?
        of(null) :
        DialogService.showConfirmation("Clear Private Key", "are you sure? this private key cannot be recovered")
      ),
      first()
    ).subscribe((result) =>{
      if (result == true) MyWalletServices.UpdateMyMasternode({output: this.props.output, privateKey: null, encryptedPrivateKey: null })
    },
    (error) =>{
      DialogService.showMessage("Error",error).subscribe();
    });
  }

  

  handleSetPrivateKey = () => {
    this.handleMenuClose();

    GetMasternodePrivateKeyObservable.pipe(
      switchMap(privateKey => privateKey == null ?
        of(null) :
        IsWalletEncryptedObservable.pipe(
        switchMap(walletEncrypted => walletEncrypted == false ? 
          of({privateKey: privateKey}):
          EncryptPrivateKeyObservable(privateKey).pipe(
            map(encryptedPrivateKey => encryptedPrivateKey == null ?
              null :
              {encryptedPrivateKey: encryptedPrivateKey}
            )
          )
        )
      )),
      first()
    )
    .subscribe(data =>{
      if (data != null) MyWalletServices.UpdateMyMasternode(Object.assign({},{output: this.props.output}, data));
    },
    (error) =>{
      DialogService.showMessage("Error",error).subscribe();
    });
  }


  handleMenuRemoveFromMyMns = () => {
    this.handleMenuClose();


    IsWalletEncryptedObservable.pipe(
      switchMap(walletEncrypted => walletEncrypted == false ? of(""): GetWalletPasswordObservable),
      switchMap((walletPassword) => walletPassword == null ?
        of(null) :
        DialogService.showConfirmation("Remove My Masternode", this.state.myMn.encryptedPrivateKey == null && this.state.myMn.privateKey == null ? "Are you sure?" : "Are you sure? the private key can not be recovered")
      ),
      first()
    ).subscribe((result) =>{
      if (result == true) MyWalletServices.deleteMyMasternode(this.props.output);
    },
    (error) =>{
      DialogService.showMessage("Error",error).subscribe();
    });

  };

  handleMenuAddToMyAddresses = () => {
    this.handleMenuClose();
    
    DialogService.showDialog(MyAddressDialog,{
      address: this.props.payee
    }).subscribe();
  };

  handleMenuRemoveFromMyAddresses = () => {
    this.handleMenuClose();


    IsWalletEncryptedObservable.pipe(
      switchMap(walletEncrypted => walletEncrypted == false ? of(""): GetWalletPasswordObservable),
      switchMap((walletPassword) => walletPassword == null ?
        of(null) :
        DialogService.showConfirmation("Remove My Address", this.state.myAddress.WIF == null && this.state.myAddress.encryptedWIF == null ? "Are you sure?" : "Are you sure? the private key can not be recovered")
      ),
    ).subscribe(result =>{
      if (result == true) MyWalletServices.deleteMyAddress(this.props.payee);
    },
    (error) =>{
      DialogService.showMessage("Error",error).subscribe();
    });

  };


  handleMenuAddMasternodeSubscription = () => {
    this.handleMenuClose();

    if (FirebaseServices.supported == false)
    {
      DialogService.showMessage("Failed", "Your browser doesnt support Push Notifications, please try Chrome or Firefox").subscribe();
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
            myMn != null && (myMn.privateKey != null || myMn.encryptedPrivateKey) && myAddress != null && (myAddress.WIF != null || myAddress.encryptedWIF != null)?
            <MenuItem onClick={this.handleMenuStartMasternode}>Start Masternode</MenuItem> :
            null
          }
          {
            myMn == null?
            <MenuItem onClick={this.handleMenuAddToMyMNs}>Add to My Masternodes</MenuItem> :
            [
              <MenuItem onClick={this.handleMenuEditMyMn}>Edit My Masternode</MenuItem>,
              <MenuItem onClick={this.handleMenuRemoveFromMyMns}>Remove from My Masternodes</MenuItem>,
            ]
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

          {
            myMn != null && (myMn.privateKey != null || myMn.encryptedPrivateKey != null) ?
            [
              <MenuItem onClick={this.handleExportPrivateKey}>Export Private Key</MenuItem>,
              <MenuItem onClick={this.handleClearPrivateKey}>Clear Private Key</MenuItem>  
            ]:
            <MenuItem onClick={this.handleSetPrivateKey}>Set Private Key</MenuItem>
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




