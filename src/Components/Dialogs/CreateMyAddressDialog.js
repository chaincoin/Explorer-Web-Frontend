import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';

import { TextValidator, SelectValidator, ValidatorForm} from 'react-material-ui-form-validator';
import MenuItem from '@material-ui/core/MenuItem';

import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';
import BlockchainServices from '../../Services/BlockchainServices';
import DialogService from '../../Services/DialogService';
import { switchMap } from 'rxjs/operators';
import { from, of } from 'rxjs';

import CreateAddress from '../../Observables/CreateAddress';

export default  (props) => {
  const [name, setName] = React.useState("");
  const [addressType, setAddressType] = React.useState("p2wpkh");

  const form = React.useRef(null);


  React.useEffect(() => {

  }, []);


  
  const handleAddressTypeChange = React.useMemo(() =>e =>{ 
    setAddressType(e.target.value);
  })
  const handleCreate = React.useMemo(() =>() =>{ 

    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;


      var keyPair = window.bitcoin.ECPair.makeRandom({ network: BlockchainServices.Chaincoin }); 
      var WIF = keyPair.toWIF();     

      var address = null;
      
      if (addressType == "p2wpkh") address = window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }).address; 
      else if (addressType == "p2pkh") address = window.bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }).address; 
      else if (addressType == "p2sh") address = window.bitcoin.payments.p2sh({redeem: window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }), network: BlockchainServices.Chaincoin}).address; 
      else return;


      CreateAddress({
        address: address,
        name:name,
        WIF:WIF
      }).subscribe(() => props.onClose());
      
    });
    
  });


  

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
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
        <Button onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleCreate} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}