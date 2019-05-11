import React from 'react';
import { combineLatest } from 'rxjs';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from "react-router-dom";



import MyWalletServices from '../Services/MyWalletServices';
import NotificationServices from '../Services/NotificationServices';


const styles = theme => ({
  root: {
  }
});

class MasternodeMenu extends React.Component {
  state = {
    menuAnchorEl: null,
    addToMyMns: true,
    addToMyAddresses: true,
    addMasternodeSubscription:true
  };

  subscription = null
 

  handleMenuClick = (event) =>{

    const currentTarget = event.currentTarget;

    this.subscription = combineLatest(MyWalletServices.myMasternodes, MyWalletServices.myAddresses, NotificationServices.masternodeSubscription(this.props.output)).subscribe(
      ([myMasternodes, myAddresses, masternodeSubscription]) =>{

        var addToMyMns = true;
        if (myMasternodes != null)
        {
          myMasternodes.forEach(myMn =>{
            if (myMn.output == this.props.output) addToMyMns = false;
          });
        }
        
        var addToMyAddresses = true;
        if (myAddresses != null)
        {
          myAddresses.forEach(myAddress =>{
            if (myAddress.address == this.props.payee) addToMyAddresses = false;
          });
        }
        

        this.setState({
          menuAnchorEl: currentTarget,
          addToMyMns: addToMyMns,
          addToMyAddresses:addToMyAddresses,
          addMasternodeSubscription:masternodeSubscription == false
        });
    });
    

  };

  handleMenuClose = () => {
    if (this.subscription != null) this.subscription.unsubscribe();
    this.setState({ menuAnchorEl: null });
  };

  
  handleMenuAddToMyMNs = () => {
    this.handleMenuClose();
      var name = prompt("Please enter a name for the masternode");
      if (name == null) return;

      MyWalletServices.addMyMasternode(name, this.props.output); //TODO: handle error
  };

  handleMenuRemoveFromMyMns = () => {
    this.handleMenuClose();

    if (window.confirm("Are you sure?") == false) return;
    MyWalletServices.deleteMyMasternode(this.props.output); //TODO: handle error
  };

  handleMenuAddToMyAddresses = () => {
    this.handleMenuClose();
      var name = prompt("Please enter a name for the address");
      if (name == null) return;

      MyWalletServices.addMyAddress(name, this.props.payee); //TODO: handle error
  };

  handleMenuRemoveFromMyAddresses = () => {
    this.handleMenuClose();

    if (window.confirm("Are you sure?") == false) return;
    MyWalletServices.deleteMyAddress(this.props.payee); //TODO: handle error
  };


  handleMenuAddMasternodeSubscription = () => {
    this.handleMenuClose();

    NotificationServices.saveMasternodeSubscription(this.props.output); //TODO: handle error
  };

  handleMenuRemoveMasternodeSubscription = () => {
    this.handleMenuClose();

    NotificationServices.deleteMasternodeSubscription(this.props.output); //TODO: handle error
  };

  componentDidMount() {

  }

  componentWillUnmount = () => {
    if (this.subscription != null) this.subscription.unsubscribe();
  }





 
  render() {
    const { classes, payee, output, hideViewMasternode } = this.props;
    const { menuAnchorEl, addToMyMns, addToMyAddresses, addMasternodeSubscription } = this.state;

    

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
            addToMyMns == true?
            <MenuItem onClick={this.handleMenuAddToMyMNs}>Add to My Masternodes</MenuItem> :
            <MenuItem onClick={this.handleMenuRemoveFromMyMns}>Remove from My Masternodes</MenuItem>
          }
          {
            addToMyAddresses == true?
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




