import React from 'react';
import { combineLatest } from 'rxjs';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from "react-router-dom";



import MyWalletServices from '../Services/MyWalletServices';



const styles = theme => ({
  root: {
  }
});

class MasternodeMenu extends React.Component {
  state = {
    menuAnchorEl: null,
    addToMyMns: true,
    addToMyAddresses: true
  };

  subscription = null
 

  handleMenuClick = (event) =>{
    this.subscription = combineLatest(MyWalletServices.myMasternodes, MyWalletServices.myAddresses).subscribe(
      ([myMasternodes, myAddresses]) =>{

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
          addToMyMns: addToMyMns,
          addToMyAddresses:addToMyAddresses
        });
    });
    
    this.setState({ menuAnchorEl: event.currentTarget });
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

  componentDidMount() {

    this.subscription = combineLatest(MyWalletServices.myMasternodes, MyWalletServices.myAddresses).subscribe(
      ([myMasternodes, myAddresses]) =>{

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
          addToMyMns: addToMyMns,
          addToMyAddresses:addToMyAddresses
        });
    });

  }

  componentWillUnmount = () => {
    if (this.subscription != null) this.subscription.unsubscribe();
  }





 
  render() {
    const { classes, payee, output, hideViewMasternode } = this.props;
    const { menuAnchorEl, addToMyMns, addToMyAddresses } = this.state;

    

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




