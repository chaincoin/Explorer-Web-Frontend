import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import Checkbox from '@material-ui/core/Checkbox';

import MyWalletServices from '../../../../Services/MyWalletServices';
import BlockchainServices from '../../../../Services/BlockchainServices';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [wif, setWif] = React.useState("");
  const [wifValid, setWifValid] = React.useState(false);

  const [p2wpkh, setP2wpkh] = React.useState(true);
  const [p2wpkhAddress, setP2wpkhAddress] = React.useState("");

  const [p2pkh, setP2pkh] = React.useState(true);
  const [p2pkhAddress, setP2pkhAddress] = React.useState("");

  const [p2sh, setP2sh] = React.useState(true);
  const [p2shAddress, setP2shAddress] = React.useState("");

  const form = React.useRef(null);


  React.useEffect(() => {
    console.log('mounted');

    ValidatorForm.addValidationRule('isWifValid', (wif, arg2) => {
      debugger;
      console.log(arg2)
      try{
        var keyPair = window.bitcoin.ECPair.fromWIF(wif, BlockchainServices.Chaincoin); 
        return true;
      }
      catch(ex){
        return false;
      }
    });

    return () => {
      console.log('will unmount');
      debugger
      //ValidatorForm.removeValidationRule('isWifValid');
    };
  }, []);



  const handleImport = () =>{ //TODO: validation and error handling
debugger;
    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;

      var addType = [p2wpkh,p2pkh,p2sh].filter(type => type).length > 1;



      if (p2wpkh){
        MyWalletServices.addMyAddress(addType ? name + "-P2WPKH" : name,p2wpkhAddress, wif);
      }
      if (p2pkh){
        MyWalletServices.addMyAddress(addType ? name + "-P2PKH" : name,p2pkhAddress, wif);
      }
      if (p2sh){
        MyWalletServices.addMyAddress(addType ? name + "-P2SH" : name,p2shAddress, wif);
      }
      
    })
    
    
  }

  const handleWifChange= (e) =>{
    var wif = e.target.value;

    try{
      var keyPair = window.bitcoin.ECPair.fromWIF(wif, BlockchainServices.Chaincoin); 
      var p2wpkhAddress = window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }).address; // eslint-disable-line no-undef
      var p2pkhAddress = window.bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }).address;
      var p2shAddress = window.bitcoin.payments.p2sh({redeem: window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }), network: BlockchainServices.Chaincoin}).address
    
      setP2wpkhAddress(p2wpkhAddress);
      setP2pkhAddress(p2pkhAddress);
      setP2shAddress(p2shAddress);
      setWifValid(true);
    }
    catch(ex){
      setP2wpkhAddress("");
      setP2pkhAddress("");
      setP2shAddress("");
      setWifValid(false);
    }
    
    setWif(wif);
  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={(e) => setOpen(true)}>
        Import WIF
      </Button>
      <Dialog open={open} onClose={(e)=> setOpen(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Import WIF</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter WIF
          </DialogContentText>

          <ValidatorForm ref={form} onError={errors => console.log(errors)} >

            <FormGroup>
              <TextValidator
                label="Name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                validators={['required']}
                errorMessages={['name required']}
              />
              <TextValidator
                label="WIF"
                onChange={handleWifChange}
                value={wif}
                validators={['required','isWifValid']}
                errorMessages={['WIF required', 'WIF invalid']}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={p2wpkh}
                    onChange={(e) => setP2wpkh(e.target.checked)}
                    color="primary"
                    inputProps={{
                      'aria-label': 'secondary checkbox',
                    }}
                  />
                }
                label={"P2WPKH: " + p2wpkhAddress}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={p2pkh}
                    onChange={(e) => setP2pkh(e.target.checked)}
                    color="primary"
                    inputProps={{
                      'aria-label': 'secondary checkbox',
                    }}
                  />
                }
                label={"P2PKH: " + p2pkhAddress}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={p2sh}
                    onChange={(e) => setP2sh(e.target.checked)}
                    color="primary"
                    inputProps={{
                      'aria-label': 'secondary checkbox',
                    }}
                  />
                }
                label={"P2SH: " + p2shAddress}
              />
            </FormGroup>
           
            
            
          
          </ValidatorForm>

        </DialogContent>
        <DialogActions>
          <Button onClick={(e)=> setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleImport} color="primary">
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}