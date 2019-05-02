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
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class MasternodeMenu extends React.Component {
  state = {
    menuAnchorEl: null,
    addToMyMns: true
  };

  subscription = null
 

  handleMenuClick = (event) =>{
    this.setState({ menuAnchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ menuAnchorEl: null });
  };

  
  handleMenuAddToMyMNs = (output) => {
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

  componentDidMount() {

    this.subscription = MyWalletServices.myMasternodes.subscribe(
      (myMasternodes) =>{

        var addToMyMns = true;

        myMasternodes.forEach(myMn =>{
          if (myMn.output == this.props.output) addToMyMns = false;
        });

        this.setState({
          addToMyMns: addToMyMns
        });
    });

  }

  componentWillUnmount = () => {
    this.subscription.unsubscribe();
  }





 
  render() {
    const { classes, payee, output, hideViewMasternode } = this.props;
    const { menuAnchorEl, addToMyMns } = this.state;

    

    return (
      <div>
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




