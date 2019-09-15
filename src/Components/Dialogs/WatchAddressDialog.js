import { from, of, throwError } from 'rxjs';
import { first, switchMap, catchError, map } from 'rxjs/operators';

import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';

import { TextValidator, ValidatorForm} from 'react-material-ui-form-validator';


import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';
import DialogService from '../../Services/DialogService';
import GetWalletPasswordObservable from '../../Observables/GetWalletPasswordObservable';
import IsWalletEncryptedObservable from '../../Observables/IsWalletEncryptedObservable';
import CreateAddress from '../../Observables/CreateAddress';



export default (props) => {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState((props.address ||""));
  

  const form = React.useRef(null);


  const handleWatch = () =>{ 
    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;

      CreateAddress({
        address: address,
        name:name
      }).subscribe(() => props.onClose());
    });
  }


  

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
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
          <Button onClick={props.onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleWatch} color="primary">
            Watch
          </Button>
        </DialogActions>
      </Dialog>
  );
}