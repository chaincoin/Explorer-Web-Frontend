import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';
import DialogService from '../../Services/DialogService';
import { first, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import GetWalletPasswordObservable from '../../Observables/GetWalletPasswordObservable';

export default  (props) => {
  const [file, setFile] = React.useState(null);

  

  function handleUpload() {
    
    if (file == null){
      DialogService.showMessage("Error", "Please select a file").subscribe();
      return;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = function(e) {
      
      if (props.checkFileContent == null)
      {
        props.onClose(e.target.result)
      }
      else
      {
        props.checkFileContent(e.target.result).subscribe(result => result == true ? 
          props.onClose(e.target.result): 
          DialogService.showMessage("Upload File","File invalid or corrupt").subscribe()
        );
      }
    };

    reader.readAsBinaryString(file);

  }

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
        {props.message}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          type="file"
          fullWidth
          onChange={e => setFile(e.target.files[0])}
        />

      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleUpload} color="primary">
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}