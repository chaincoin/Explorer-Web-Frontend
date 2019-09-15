import React from 'react';
import { combineLatest, of } from 'rxjs';
import { first, switchMap, map, filter } from 'rxjs/operators';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from "react-router-dom";

import MyAddressDialog from './Dialogs/MyAddressDialog'



import BlockchainServices from '../Services/BlockchainServices';
import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import FirebaseServices from '../Services/FirebaseServices';
import DialogService from '../Services/DialogService';


import GetAddressWif from '../Observables/GetAddressWifObservable';
import DeleteMyAddress from '../Observables/DeleteMyAddress';
import UpdateAddress from '../Observables/UpdateAddress';
import WalletAction from '../Observables/WalletAction';

const styles = theme => ({
  root: {
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'scroll',
    "-webkit-overflow-scrolling": "touch"
  },
});

class AddressMenu extends React.Component {
  state = {
    menuAnchorEl: null,
    addToMyAddresses: true
  };

  subscription = null
 

  componentDidMount() {
  }

  componentWillUnmount = () => {
    if (this.subscription != null) this.subscription.unsubscribe();
  }

  handleMenuClick = (event) =>{

    var menuAnchorEl = event.currentTarget;

    

    this.subscription = combineLatest(MyWalletServices.myAddresses, FirebaseServices.AddressNotification(this.props.address)).subscribe(
      ([myAddresses, addressSubscription]) =>{
        
        var myAddress = myAddresses.find(myAddress => {return myAddress.address == this.props.address});

        this.setState({
          myAddress,
          menuAnchorEl,
          addAddressSubscription: addressSubscription == false
        });
    });
  };

  handleMenuClose = () => {
    if (this.subscription != null) this.subscription.unsubscribe();
    this.setState({ menuAnchorEl: null });
  };

  
  handleMenuAddToMyAddresses = () => {
    this.handleMenuClose();

    DialogService.showDialog(MyAddressDialog,{
      address: this.props.address
    }).subscribe();
  };

  handleMenuEditMyAddress = () => {
    this.handleMenuClose();

    DialogService.showDialog(MyAddressDialog,{ address: this.props.address}).subscribe();
  }

  handleMenuRemoveFromMyAddresses = () => {
    this.handleMenuClose();

    DeleteMyAddress(this.props.address).subscribe();
  };


  handleMenuAddAddressSubscription = () => {
    this.handleMenuClose();
    if (FirebaseServices.supported == false)
    {
      DialogService.showMessage("Failed", "Your browser doesnt support Push Notifications, please try Chrome or Firefox").subscribe();
      return;
    }
    FirebaseServices.saveAddressNotification(this.props.address).subscribe(); //TODO: handle error
  };

  handleMenuRemoveAddressSubscription = () => {
    this.handleMenuClose();
    FirebaseServices.deleteAddressNotification(this.props.address).subscribe(); //TODO: handle error
  };



  handleMenuExportWif = () => {
    this.handleMenuClose();

    WalletAction(([encryt, decrypt]) =>{
      DialogService.showMessage("WIF", this.state.myAddress.WIF || decrypt(this.state.myAddress.encryptedWIF)).subscribe();
      return of(null);
    }).subscribe();

  };


  handleMenuSetWif = () => {
    this.handleMenuClose();


    GetAddressWif(this.props.address).pipe(
      switchMap(wif => wif == null ?
        of(null) :
        UpdateAddress({address: this.props.address, WIF:wif})
      )
    ).subscribe();
    

  };
  
  handleMenuClearWif = () => {
    this.handleMenuClose();

    UpdateAddress({address: this.props.address, WIF: null, encryptedWIF: null}).subscribe();
  };
  


  handleExportTransactions = () =>{

    var pageSize = 100;

    var getNext = (pos, fileData) => {
        if (fileData == null) fileData = "Transaction, type, pos, Date Time, Amount, Payout\r\n";


        return BlockchainServices.getAddressTxs(this.props.address, pos, pageSize > pos ? pos : pageSize).then(txs=> {
            for (var i = 0; i < txs.length; i++) {
                var timestamp = new Date(txs[i].time * 1000);


                var rowData = txs[i].txid + "," + txs[i].type + "," + (txs[i].type == "vin" ? txs[i].vin : txs[i].vout) + "," + timestamp.toLocaleTimeString() + " " + timestamp.toLocaleDateString() + "," + txs[i].value + "," + (txs[i].payout || "") + "\r\n";
                fileData = fileData + rowData;
            }

            if (pos > pageSize) return getNext(pos - pageSize, fileData);
            else return fileData;
        });
    };


    BlockchainServices.getAddress(this.props.address).pipe(first()).subscribe(_address =>{
      return getNext(_address.txCount).then(fileData =>{
          download(this.props.address + ".csv", fileData);
      });
    })

    

    function download(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  }

 
  render() {
    const { classes,address, hideViewAddress } = this.props;
    const { menuAnchorEl, myAddress, addAddressSubscription } = this.state;


    return (
      <div className={classes.root}>
        <Button variant="contained" color="primary" aria-owns={menuAnchorEl ? 'simple-menu' : undefined} aria-haspopup="true" onClick={this.handleMenuClick}>
          Menu
        </Button>
        <Menu id="simple-menu" anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={this.handleMenuClose} >
          {
            hideViewAddress == true ?
            "" :
            <Link to={"/Explorer/Address/" + address}>
              <MenuItem  onClick={this.handleMenuClose}>View Address</MenuItem>
            </Link>
          }
          
        
          {
            myAddress == null?
            <MenuItem onClick={this.handleMenuAddToMyAddresses}>Add to My Addresses</MenuItem> :
            [<MenuItem onClick={this.handleMenuEditMyAddress}>Edit My Address</MenuItem>,
              <MenuItem onClick={this.handleMenuRemoveFromMyAddresses}>Remove from My Addresses</MenuItem>]
            
          }
          {
            addAddressSubscription == true?
            <MenuItem onClick={this.handleMenuAddAddressSubscription}>Add Address Subscription</MenuItem> :
            <MenuItem onClick={this.handleMenuRemoveAddressSubscription}>Remove Address Subscription</MenuItem>
          }

          {
            myAddress == null ? 
            null :
            (
              myAddress.WIF != null || myAddress.encryptedWIF != null ?
              [
                <MenuItem onClick={this.handleMenuExportWif}>Export WIF</MenuItem>,
                <MenuItem onClick={this.handleMenuClearWif}>Clear WIF</MenuItem>  
              ]:
              <MenuItem onClick={this.handleMenuSetWif}>Set WIF</MenuItem>
            )
          }
          
          <MenuItem onClick={this.handleExportTransactions}>Export Transactions</MenuItem>
          {this.props.children}
        </Menu>
      </div>
      
    );
  }
}


AddressMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  address: PropTypes.string.isRequired
};
export default withStyles(styles)(AddressMenu);




