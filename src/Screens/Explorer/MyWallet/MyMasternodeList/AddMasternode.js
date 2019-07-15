import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';

import { TextValidator, ValidatorForm} from 'react-material-ui-form-validator';

import MyWalletServices from '../../../../Services/MyWalletServices';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [output, setOutput] = React.useState("");
  
  const [failedMessageOpen, setFailedMessageOpen] = React.useState(false);

  const form = React.useRef(null);


  React.useEffect(() => {

    ValidatorForm.addValidationRule('isChaincoinOutput', (output) => /^[a-fA-F0-9]{64}-[0-9]{1,8}$/.test(output));

  }, []);



  const handleAdd = () =>{ 
    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;

      MyWalletServices.addMyMasternode(name, output)
      .then(() => setOpen(false))
      .catch(err => setFailedMessageOpen(true)); 
    });
  }


  

  return (
    <React.Fragment>
      <Button variant="contained" color="primary" onClick={(e) => setOpen(true)}>
      Add Masternode
      </Button>
      <Dialog open={open} onClose={(e)=> setOpen(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Masternode</DialogTitle>
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
                label="Output"
                onChange={(e) => setOutput(e.target.value)}
                value={output}
                validators={['required', 'isChaincoinOutput']}
                errorMessages={['required',"Invalid"]}
              />
            </FormGroup>
          </ValidatorForm>

        </DialogContent>
        <DialogActions>
          <Button onClick={(e)=> setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAdd} color="primary">
            Add
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
            Failed to add masternode
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