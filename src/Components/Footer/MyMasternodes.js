import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { combineLatest, of } from 'rxjs';
import { map, switchMap, first } from 'rxjs/operators';

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

const MyMasternodes = (props) =>{

  const [anchorEl, setAnchorEl] = React.useState(null);
  const close = () => setAnchorEl(null);


  const mnCount = MyWalletServices.myMasternodes.pipe(
    map(myMns => myMns.length)
  );

  const enabledMnCount = MyWalletServices.myMasternodes.pipe(
    switchMap(myMns => combineLatest(myMns.map(myMn => myMn.status))),
    map(myMnStatuses =>{
        var enabled = 0;
        myMnStatuses.forEach(status => {
          if (status == "ENABLED") enabled++;
        }); //TODO: use BigDecimal library 

        return enabled;
    })
  );

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
        <ObservableList value={MyWalletServices.myMasternodes} rowComponent={rowComponent} options={({classes: props.classes, handleClose: close})}/>
        
      </Menu>
    </div>
    
  )
}

MyMasternodes.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyMasternodes);


var rowComponent = withRouter(props =>{

  const onClick = () =>{
    props.value.pipe(map(mn => mn.output), first()).subscribe(output =>{
      props.handleClose();
      props.history.push("/Explorer/MasternodeList/" + output);
    })
  }

  return (
    <MenuItem onClick={onClick}>
      <ListItemIcon className={props.classes.icon}>
        <ObservableBoolean value={props.value.pipe(
          switchMap(myMn => myMn.status),
          map(status=> status == "ENABLED")
        )}>
          <CheckIcon className={props.classes.checkIcon}/>
        </ObservableBoolean>

        <ObservableBoolean value={props.value.pipe(
          switchMap(myMn => myMn.status),
          map(status=> status != "ENABLED")
        )}>
          <CloseIcon className={props.classes.closeIcon}/>
        </ObservableBoolean>
      </ListItemIcon>
      <ObservableText value={props.value.pipe(map(mn => mn.name))} loadingText="Loading" />
    </MenuItem>
  )
});