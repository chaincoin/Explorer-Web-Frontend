import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';

import { TextValidator, ValidatorForm} from 'react-material-ui-form-validator';

import MyWalletServices from '../../Services/MyWalletServices';
import DialogService from '../../Services/DialogService';



export default (props) => {
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState((props.name ||""));
  const [output, setOutput] = React.useState((props.output ||""));
  const [privateKey, setPrivateKey] = React.useState((props.privateKey ||""));

  const form = React.useRef(null);


  React.useEffect(() => {

    const subscription = MyWalletServices.myMasternode(output).subscribe((myMn) =>{

      setEditing(myMn != null);
      if (myMn != null)
      {
        setName(myMn.name);
        setPrivateKey(myMn.privateKey);
      }
    });
    
    return () =>{
      subscription.unsubscribe();
    }
  }, []);



  const handleSave = () =>{ 
    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;

      //TODO: need to make sure the private key is correct for this MN

      if (editing)
      {

        MyWalletServices.UpdateMyMasternode(name, output)
        .then(() => props.onClose())
        .catch(err => {
          DialogService.showMessage("Failed","Failed to update My Mn")
        }); 
      }
      else
      {
        MyWalletServices.addMyMasternode(name, output)
        .then(() => props.onClose())
        .catch(err => {
          DialogService.showMessage("Failed","Failed to add My Mn")
        }); 
      }
      
    });
  }


  

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{editing ? "Update My Mn" : "Add My Mn"}</DialogTitle>
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
              disabled={editing}
            />
             <TextValidator
              label="Masternode Private Key"
              onChange={(e) => setPrivateKey(e.target.value)}
              value={privateKey}
              validators={['isWifValid']}
              errorMessages={["Invalid"]}
            />
          </FormGroup>
        </ValidatorForm>

      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          {editing ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}