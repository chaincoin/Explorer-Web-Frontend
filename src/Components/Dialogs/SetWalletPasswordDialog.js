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

import MyWalletServices from '../../Services/MyWalletServices';
import BlockchainServices from '../../Services/BlockchainServices';
import DialogService from '../../Services/DialogService';

export default (props) => {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");




  const form = React.useRef(null);


  React.useEffect(() => {


    return () => {
    };
  }, []);



  const handleSetWalletPassword = () =>{

    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;

      if (password != confirmPassword){
        DialogService.showMessage("Error","Password doesnt match confirmation password");
        return;
      }
      
    });

  }

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Set Wallet Password</DialogTitle>
      <DialogContent>

        <ValidatorForm ref={form} >

          <FormGroup>
            <TextValidator
              label="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              validators={['required']}
              errorMessages={['required']}
            />
            <TextValidator
              label="WIF"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              validators={['required']}
              errorMessages={['required']}
            />
            
          </FormGroup>
          
          
          
        
        </ValidatorForm>

      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSetWalletPassword} color="primary">
          Set Wallet Password
        </Button>
      </DialogActions>
    </Dialog>
    
  );
}