import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { TextValidator, SelectValidator, ValidatorForm} from 'react-material-ui-form-validator';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';

import MyWalletServices from '../../../../Services/MyWalletServices';
import BlockchainServices from '../../../../Services/BlockchainServices';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  
  const [failedMessageOpen, setFailedMessageOpen] = React.useState(false);

  const form = React.useRef(null);


  React.useEffect(() => {

    ValidatorForm.addValidationRule('isChaincoinAddress', (address) => {
      try {
        window.bitcoin.address.toOutputScript(address,BlockchainServices.Chaincoin)
        return true
      } catch (e) {
        return false
      }
    });

  }, []);



  const handleWatch = () =>{ 
    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;

      MyWalletServices.addMyAddress(name,address)
      .then(() => setOpen(false))
      .catch(err => setFailedMessageOpen(true)); 
    });
  }


  

  return (
    <React.Fragment>
      <Button variant="contained" color="primary" onClick={(e) => setOpen(true)}>
      Watch Address
      </Button>
      <Dialog open={open} onClose={(e)=> setOpen(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Watch Address</DialogTitle>
        <DialogContent>

          <ValidatorForm ref={form} >

            <FormGroup>
              <TextValidator
                label="Name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                validators={['required']}
                errorMessages={['required']}
              />
              <TextValidator
                label="Address"
                onChange={(e) => setAddress(e.target.value)}
                value={address}
                validators={['required', 'isChaincoinAddress']}
                errorMessages={['required',"Invalid"]}
              />
            </FormGroup>
          </ValidatorForm>

        </DialogContent>
        <DialogActions>
          <Button onClick={(e)=> setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleWatch} color="primary">
            Watch
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={failedMessageOpen}
        onClose={(e) => setFailedMessageOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Watch Failed"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Failed to watch address
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => setFailedMessageOpen(false)} color="primary" autoFocus>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}