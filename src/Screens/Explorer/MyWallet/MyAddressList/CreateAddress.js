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
  const [addressType, setAddressType] = React.useState("p2wpkh");

  const [failedMessageOpen, setFailedMessageOpen] = React.useState(false);

  const form = React.useRef(null);


  React.useEffect(() => {

  }, []);


  
  const handleAddressTypeChange = (e) =>{ 
    setAddressType(e.target.value);
  }
  const handleCreate = () =>{ 

    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;
      
      var keyPair = window.bitcoin.ECPair.makeRandom({ network: BlockchainServices.Chaincoin }); 
      var WIF = keyPair.toWIF();     

      var address = null;
      
      if (addressType == "p2wpkh") address = window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }).address; 
      else if (addressType == "p2pkh") address = window.bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }).address; 
      else if (addressType == "p2sh") address = window.bitcoin.payments.p2sh({redeem: window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }), network: BlockchainServices.Chaincoin}).address; 
      else return;
      
      MyWalletServices.addMyAddress(name, address, WIF)
      .then(() => setOpen(false))
      .catch(err => setFailedMessageOpen(true)); 
    });
    
  }


  

  return (
    <React.Fragment>
      <Button variant="contained" color="primary" onClick={(e) => setOpen(true)}>
      Create Address
      </Button>
      <Dialog open={open} onClose={(e)=> setOpen(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create Address</DialogTitle>
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
              

              <SelectValidator

                value={addressType}
                onChange={handleAddressTypeChange}

              >
                <MenuItem value={"p2wpkh"}>P2WPKH</MenuItem>
                <MenuItem value={"p2pkh"}>P2PKH</MenuItem>
                <MenuItem value={"p2sh"}>P2SH</MenuItem>
              </SelectValidator>

            </FormGroup>
           
            
            
          
          </ValidatorForm>

        </DialogContent>
        <DialogActions>
          <Button onClick={(e)=> setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreate} color="primary">
            Create
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
            Failed to create address
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