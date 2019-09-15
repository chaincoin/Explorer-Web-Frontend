import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';

function CoinControlMenu({input}) {
  const [anchorEl, setAnchorEl] = React.useState(null);


  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }


  function handleLock(){
      if (input.lockState == null) MyWalletServices.addInputLockState(input.unspent.txid + "-" + input.unspent.vout, true)
      else  MyWalletServices.updateInputLockState(input.unspent.txid + "-" + input.unspent.vout, true);
      handleClose();
  }


  function handleUnlock(){
    if (input.lockState == null) MyWalletServices.addInputLockState(input.unspent.txid + "-" + input.unspent.vout, false)
    else  MyWalletServices.updateInputLockState(input.unspent.txid + "-" + input.unspent.vout, false);
    handleClose();
}


  return (
    <div>
        <Button variant="contained" color="primary"
            aria-owns={anchorEl ? 'simple-menu' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
        >
            Menu
        </Button>
        <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {
            input.disabled == false?
            (
                <MenuItem variant="contained" color="primary" onClick={handleLock}>
                    Lock
                </MenuItem>
                
            ):
            (
                <MenuItem variant="contained" color="primary" onClick={handleUnlock}>
                    Unlock
                </MenuItem>
            )
        }
        {
            input.lockState != null ?
            (
                <MenuItem variant="contained" color="primary" onClick={(e) =>{ MyWalletServices.deleteInputLockState(input.unspent.txid + "-" + input.unspent.vout); handleClose();}}>
                Clear Locked State
                </MenuItem>
            ): null
        }
        </Menu>
    </div>
  );
}

export default CoinControlMenu;
