import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import DialogService from '../../Services/DialogService';


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
    <Dialog open={true} onClose={() => props.onError("Cancelled by user")} aria-labelledby="form-dialog-title">
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
        <Button onClick={() => props.onError("Cancelled by user")} color="primary">
          Cancel
        </Button>
        <Button onClick={handleUpload} color="primary">
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}