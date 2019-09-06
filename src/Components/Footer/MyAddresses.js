import React from 'react';
import update from 'react-addons-update'; // ES6
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { combineLatest } from 'rxjs';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { Link } from "react-router-dom";

import ObservableText from "../ObservableText";
import ObservableList from "../ObservableList";

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


      myAddresses: null
    };

    this.totalBalance = MyWalletServices.myAddresses.pipe(
      switchMap(myAddresses => combineLatest(myAddresses.map(myAddress => myAddress.balance))),
      map(addressBalances =>{
          var totalBalance = 0;
          addressBalances.forEach(balance => totalBalance = totalBalance + balance); //TODO: use BigDecimal library 

          return Math.round(totalBalance) + " chc";
      })
    );

  }


  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };



  handleClose = () => {
    this.setState({ anchorEl: null });
  };


  componentDidMount() {
  }

  componentWillUnmount() {
  }

 

  render(){
    const { classes } = this.props;
    const { myAddresses,  anchorEl } = this.state;

   

    return (
    <div className={classes.root}>
      <Button className={classes.button} variant="contained" color="primary" aria-owns={anchorEl ? 'simple-menu' : undefined} aria-haspopup="true" onClick={this.handleClick}>
        <ObservableText value={this.totalBalance} loadingText="Loading" />
      </Button>

      <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
        <Link to={"/Explorer/MyWallet/MyAddresses"}>
          <MenuItem onClick={this.handleClose}>
            My Addresses
          </MenuItem>
        </Link>
        <ObservableList value={MyWalletServices.myAddresses} rowComponent={rowComponent} options={({handleClose:this.handleClose})}/>
        
        
      </Menu>
    </div>
      
    );
  }
}

MyAddresses.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAddresses);



var rowComponent = props =>{

  return (
    <Link to={"/Explorer/Address/" + props.value.address}>
      <MenuItem onClick={props.handleClose}>
        <ObservableText value={props.value.pipe(map(address => address.name))} loadingText="Loading" />
        : 
        <ObservableText value={props.value.pipe(switchMap(address => address.balance),map(balance => Math.round(balance) + " chc"))} loadingText="Loading" />
      </MenuItem>
    </Link>
  )
}
