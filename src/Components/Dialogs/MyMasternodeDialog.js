import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';

import { TextValidator, ValidatorForm} from 'react-material-ui-form-validator';

import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';

import CreateMyMasternode from '../../Observables/CreateMyMasternode';
import UpdateMyMasternode from '../../Observables/UpdateMyMasternode';



export default (props) => {
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState((props.name ||""));
  const [output, setOutput] = React.useState((props.output ||""));

  const form = React.useRef(null);


  React.useEffect(() => {

    const subscription = MyWalletServices.myMasternode(output).subscribe((myMn) =>{

      setEditing(myMn != null);
      if (myMn != null)
      {
        setName(myMn.name);
      }
    });
    
    return () =>{
      subscription.unsubscribe();
    }
  }, []);



  const handleSave = () =>{ 
    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;

      if (editing) UpdateMyMasternode({name:name, output:output}).subscribe(() => props.onClose());
      else CreateMyMasternode({name:name, output:output}).subscribe(() => props.onClose());
      
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