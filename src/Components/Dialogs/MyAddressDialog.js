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
import UpdateAddress from '../../Observables/UpdateAddress';

export default (props) => {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState((props.address ||""));

  const form = React.useRef(null);


  React.useEffect(() => {

    const subscription = MyWalletServices.myAddress(props.address).subscribe((myAddress) =>{
      if (myAddress != null)
      {
        setName(myAddress.name);
      }
    });
    
    return () =>{
      subscription.unsubscribe();
    }
  }, []);



  const handleSave = () =>{ 
    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;

      UpdateAddress({
        address: address,
        name:name
      }).subscribe(() => props.onClose());

    });
  }



  

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Update My Address</DialogTitle>
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
                disabled={true}
              />

            

            </FormGroup>
          </ValidatorForm>


          
          
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
  );
}