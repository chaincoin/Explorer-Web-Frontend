import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';

import { TextValidator, ValidatorForm} from 'react-material-ui-form-validator';


import DialogService from '../../Services/DialogService';

export default (props) => {
  const [password, setPassword] = React.useState("");


  const form = React.useRef(null);


  React.useEffect(() => {


    return () => {
    };
  }, []);



  const handleCheckPassword = () =>{

    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;


      if (props.checkPassword == null)
      {
        props.onClose(password)
      }
      else
      {
        props.checkPassword(password).subscribe(result => result == true ? 
          props.onClose(password): 
          DialogService.showMessage("","Incorrect Password").subscribe()
        );
      }
    });

  }

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{props.title}</DialogTitle>
      <DialogContent>

        <ValidatorForm ref={form} >

          <FormGroup>
            <TextValidator
              label="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              validators={['required']}
              errorMessages={['required']}
              type="password"
            />
          </FormGroup>
          
        
        </ValidatorForm>

      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onClose()} color="primary">
          Cancel
        </Button>
        <Button onClick={handleCheckPassword} color="primary">
          Okay
        </Button>
      </DialogActions>
    </Dialog>
    
  );
}