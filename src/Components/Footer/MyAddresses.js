import React from 'react';
import update from 'react-addons-update'; // ES6
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { combineLatest } from 'rxjs';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { Link, withRouter } from "react-router-dom";

import ObservableText from "../ObservableText";
import ObservableList from "../ObservableList";

import BlockchainServices from '../../Services/BlockchainServices';
import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';
import { switchMap, map, first } from 'rxjs/operators';

const styles = {
  root: {
   display:"inline"
  },
  button:{
    "text-transform": "initial"
  }
};

const MyAddresses = (props) =>{

  const [anchorEl, setAnchorEl] = React.useState(null);
  const close = () => setAnchorEl(null);

  
  const totalBalance = MyWalletServices.myAddresses.pipe(
    switchMap(myAddresses => combineLatest(myAddresses.map(myAddress => myAddress.balance))),
    map(addressBalances =>{
        var totalBalance = 0;
        addressBalances.forEach(balance => totalBalance = totalBalance + balance); //TODO: use BigDecimal library 

        return Math.round(totalBalance) + " chc";
    })
  );

  

  return (
    <div className={props.classes.root}>
      <Button className={props.classes.button} variant="contained" color="primary" aria-owns={anchorEl ? 'simple-menu' : undefined} aria-haspopup="true" onClick={e => setAnchorEl(e.currentTarget)}>
        <ObservableText value={totalBalance} loadingText="Loading" />
      </Button>

      <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <Link to={"/Explorer/MyWallet/MyAddresses"}>
          <MenuItem onClick={close}>
            My Addresses
          </MenuItem>
        </Link>
        <ObservableList value={MyWalletServices.myAddresses} rowComponent={rowComponent} options={({handleClose: close})}/>
        
        
      </Menu>
    </div>
      
  );
}

MyAddresses.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAddresses);



var rowComponent = withRouter(props =>{

  const onClick = () =>{
    props.value.pipe(map(address => address.address), first()).subscribe(address =>{
      props.handleClose();
      props.history.push("/Explorer/Address/" + address);
    })
  }

  return (
    <MenuItem onClick={onClick}>
      <ObservableText value={props.value.pipe(map(address => address.name))} loadingText="Loading" />
      : 
      <ObservableText value={props.value.pipe(switchMap(address => address.balance),map(balance => Math.round(balance) + " chc"))} loadingText="Loading" />
    </MenuItem>

    
  )
});
