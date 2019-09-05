import React from 'react';
import update from 'react-addons-update'; // ES6
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { combineLatest } from 'rxjs';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { Link } from "react-router-dom";


import BlockchainServices from '../../Services/BlockchainServices';
import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';
import { switchMap, map } from 'rxjs/operators';

const styles = {
  root: {
   display:"inline"
  },
  button:{
    "text-transform": "initial"
  }
};

class MyAddresses extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,


      myAddresses: null,
      mnProblem: false
    };

    this.myAddressesSubscription = null;
    this.addressSubscriptions = [];
  }


  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };



  handleClose = () => {
    this.setState({ anchorEl: null });
  };


  componentDidMount() {

    this.setState({windowWidth: window.innerWidth});


    this.myAddressesSubscription = MyWalletServices.myAddresses.pipe(
      switchMap(myAddresses => combineLatest(
          myAddresses.map(myAddress => BlockchainServices.getAddress(myAddress.address).pipe(
            map(address => Object.assign({},myAddress, {data: address}))
          ))
        )
      )
    ).subscribe((myAddresses =>{
      this.setState({
        myAddresses: myAddresses
      })
    }))
    
    
  }

  componentWillUnmount() {
    this.myAddressesSubscription.unsubscribe();
    this.addressSubscriptions.forEach(v => v.unsubscribe());

  }



  render(){
    const { classes } = this.props;
    const { myAddresses,  anchorEl } = this.state;

    var totalBalance = null; //TODO: use BigDecimal library 

    if (myAddresses != null)
    {
      var balances = myAddresses.map(myAddress => myAddress.data == null ? null : myAddress.data.balance);
      if (balances.indexOf(null) == -1){
        totalBalance = 0;
        balances.forEach(balance => totalBalance = totalBalance + balance);
      }
    }
    

    return (
    <div className={classes.root}>
      <Button className={classes.button} variant="contained" color="primary" aria-owns={anchorEl ? 'simple-menu' : undefined} aria-haspopup="true" onClick={this.handleClick}>
        {
          totalBalance == null ? 
          "Loading ":
          Math.round(totalBalance) + " chc"
        }
      </Button>

      <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
        <Link to={"/Explorer/MyWallet/MyAddresses"}>
          <MenuItem onClick={this.handleClose}>
            My Addresses
          </MenuItem>
        </Link>
        {
          myAddresses == null ? 
          "" :
          myAddresses.map(myAddress =>
            (
              <Link to={"/Explorer/Address/" + myAddress.address}>
                <MenuItem onClick={this.handleClose}>
                  {myAddress.name}: {myAddress.data == null ? "loading" : Math.round(myAddress.data.balance) + " chc"}
                </MenuItem>
              </Link>
            )
          )
        }
        
      </Menu>
    </div>
      
    );
  }

 
  
}

MyAddresses.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAddresses);


