import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from "react-router-dom";


import BlockchainServices from '../Services/BlockchainServices';
import MyWalletServices from '../Services/MyWalletServices';



const styles = theme => ({
  root: {
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class AddressMenu extends React.Component {
  state = {
    menuAnchorEl: null,
    addToMyAddresses: true
  };

  subscription = null
 

  handleMenuClick = (event) =>{
    this.setState({ menuAnchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ menuAnchorEl: null });
  };

  
  handleMenuAddToMyAddresses = () => {
    this.handleMenuClose();
      var name = prompt("Please enter a name for the address");
      if (name == null) return;

      MyWalletServices.addMyAddress(name, this.props.address); //TODO: handle error
  };

  handleMenuRemoveFromMyAddresses = () => {
    this.handleMenuClose();

    if (window.confirm("Are you sure?") == false) return;
    MyWalletServices.deleteMyAddress(this.props.address); //TODO: handle error
  };

  componentDidMount() {

    this.subscription = MyWalletServices.myAddresses.subscribe(
      (myAddresses) =>{

        var addToMyAddresses = true;

        myAddresses.forEach(myMn =>{
          if (myMn.address == this.props.address) addToMyAddresses = false;
        });

        this.setState({
          addToMyAddresses: addToMyAddresses
        });
    });

  }

  componentWillUnmount = () => {
    this.subscription.unsubscribe();
  }





 
  render() {
    const { classes,address, hideViewAddress } = this.props;
    const { menuAnchorEl, addToMyAddresses } = this.state;

    

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
            addToMyAddresses == true?
            <MenuItem onClick={this.handleMenuAddToMyAddresses}>Add to My Addresses</MenuItem> :
            <MenuItem onClick={this.handleMenuRemoveFromMyAddresses}>Remove from My Addresses</MenuItem>
          }
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




