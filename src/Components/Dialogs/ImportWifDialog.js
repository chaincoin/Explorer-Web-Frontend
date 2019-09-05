import { of, from, combineLatest, throwError } from 'rxjs';
import { first, switchMap, catchError, map } from 'rxjs/operators';

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

import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';
import BlockchainServices from '../../Services/BlockchainServices';
import DialogService from '../../Services/DialogService';

import GetWalletPasswordObservable from '../../Observables/GetWalletPasswordObservable';
import isWalletEncryptedObservable from '../../Observables/IsWalletEncryptedObservable';


export default (props) => {
  const [name, setName] = React.useState("");
  const [wif, setWif] = React.useState("");

  const [p2wpkh, setP2wpkh] = React.useState(true);
  const [p2wpkhAddress, setP2wpkhAddress] = React.useState("");

  const [p2pkh, setP2pkh] = React.useState(true);
  const [p2pkhAddress, setP2pkhAddress] = React.useState("");

  const [p2sh, setP2sh] = React.useState(true);
  const [p2shAddress, setP2shAddress] = React.useState("");



  const form = React.useRef(null);


  React.useEffect(() => {


    return () => {
    };
  }, []);



  const handleImport = () =>{

    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;

      var addType = [p2wpkh,p2pkh,p2sh].filter(type => type).length > 1;

     
      isWalletEncryptedObservable.pipe(
        switchMap(walletEncrypted => walletEncrypted == false ? 
          combineLatest(
            p2wpkh ? MyWalletServices.addMyAddress(addType ? name + "-P2WPKH" : name,p2wpkhAddress, wif): of(true),
            p2pkh ? MyWalletServices.addMyAddress(addType ? name + "-P2PKH" : name,p2pkhAddress, wif): of(true),
            p2sh ? MyWalletServices.addMyAddress(addType ? name + "-P2SH" : name,p2shAddress, wif): of(true),
          ).pipe(map(r => true),catchError(err => throwError("Import of one or more of the addresses has failed"))) :
          GetWalletPasswordObservable.pipe(
            switchMap((walletPassword) => walletPassword == null?
              of(false) :
              combineLatest(
                p2wpkh ? from(MyWalletServices.addMyAddress(addType ? name + "-P2WPKH" : name,p2wpkhAddress, null, MyWalletServices.encrypt(walletPassword,wif))): of(true),
                p2pkh ? from(MyWalletServices.addMyAddress(addType ? name + "-P2PKH" : name,p2pkhAddress, null, MyWalletServices.encrypt(walletPassword,wif))): of(true),
                p2sh ? from(MyWalletServices.addMyAddress(addType ? name + "-P2SH" : name,p2shAddress, null, MyWalletServices.encrypt(walletPassword,wif))): of(true),
              ).pipe(map(r => true),catchError(err => throwError("Import of one or more of the addresses has failed")))
            )
          )
        ),
        first()
      ).subscribe(
        (result) =>{
          if (result == true) props.onClose();
        },
        err =>{ 
          DialogService.showMessage("Error",err).subscribe();
        }
      );      
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
    }
    catch(ex){
      setP2wpkhAddress("");
      setP2pkhAddress("");
      setP2shAddress("");
    }
    
    setWif(wif);
  }

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Import WIF</DialogTitle>
      <DialogContent>

        <ValidatorForm ref={form} >

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
        <Button onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleImport} color="primary">
          Import
        </Button>
      </DialogActions>
    </Dialog>
    
  );
}