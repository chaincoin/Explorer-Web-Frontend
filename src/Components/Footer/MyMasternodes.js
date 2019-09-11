import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { combineLatest, of } from 'rxjs';
import { map, switchMap, first, distinctUntilChanged, startWith } from 'rxjs/operators';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

import { Link, withRouter } from "react-router-dom";

import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';
import ObservableText from '../ObservableText';
import ObservableList from '../ObservableList';
import ObservableBoolean from '../ObservableBoolean';
import { ListItemText } from '@material-ui/core';
import BlockchainServices from '../../Services/BlockchainServices';

const styles = theme => ({
  root: {
   display:"inline"
  },
  button:{
    "text-transform": "initial"
  },
  menuItem: {
    
  },
  primary: {},
  icon: {},
  checkIcon: {color:"green"},
  closeIcon: {color:"red"}
});

const MyMasternodes = withStyles(styles)(props =>{
  const [anchorEl, setAnchorEl] = React.useState(null);
  const close = () => setAnchorEl(null);

  

  const mnCount =  React.useMemo(()=>MyWalletServices.myMasternodes.pipe(
    map(myMns => myMns.length)
  ));

  const enabledMnCount =  React.useMemo(()=>MyWalletServices.myMasternodes.pipe(
    switchMap(myMns => combineLatest(myMns.map(myMn => myMn.status))),
    map(myMnStatuses =>{
        var enabled = 0;
        myMnStatuses.forEach(status => {
          if (status == "ENABLED") enabled++;
        });

        return enabled;
    })
  ));


  const list =  React.useMemo(()=>combineLatest(MyWalletServices.myMasternodes, BlockchainServices.masternodeList.pipe(startWith(null))).pipe(
    map(([myMasternodes, masternodeList])=> myMasternodes.map(myMn => ({
      myMn:myMn,
      mn: masternodeList == null ? null : masternodeList[myMn.output]
    })))
  ));




  return (
    <div className={props.classes.root}>
      <Button className={props.classes.button} variant="contained" color="primary" aria-owns={anchorEl ? 'simple-menu' : undefined} aria-haspopup="true" onClick={e => setAnchorEl(e.currentTarget)}>
        
        <ObservableBoolean value={combineLatest(enabledMnCount, mnCount).pipe(map(([enabledMnCount,mnCount]) => enabledMnCount == mnCount))}>
          <CheckIcon className={props.classes.checkIcon}/>
        </ObservableBoolean>

        <ObservableBoolean value={combineLatest(enabledMnCount, mnCount).pipe(map(([enabledMnCount,mnCount]) => enabledMnCount != mnCount))}>
          <CloseIcon className={props.classes.closeIcon}/>
        </ObservableBoolean>
        <ObservableText value={combineLatest(enabledMnCount, mnCount).pipe(map(([enabledMnCount,mnCount]) => `${enabledMnCount}/${mnCount}`))} loadingText="Loading" />
      </Button>

      <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <Link to={"/Explorer/MyWallet/MyMasternodes"}>
          <MenuItem onClick={close}>
            My Masternodes
          </MenuItem>
        </Link>
        <ObservableList value={list} rowComponent={rowComponent} options={({classes: props.classes, handleClose: close})}/>
        
      </Menu>
    </div>
    
  )
});

MyMasternodes.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default MyMasternodes;


var rowComponent = props =>{
  const {myMn, mn} = props.value;

  return (
    <Link to={"/Explorer/MasternodeList/" + myMn.output}>
      <MenuItem className={props.classes.menuItem} onClick={props.handleClose}>
        <ListItemIcon className={props.classes.icon}>
          {
            mn == null || mn.status != "ENABLED" ?
            <CloseIcon className={props.classes.closeIcon}/> :
            <CheckIcon className={props.classes.checkIcon}/>
          }
        </ListItemIcon>
        <ListItemText classes={{ primary: props.classes.primary }} inset primary={myMn.name} />
      </MenuItem>
    </Link>
  )
};