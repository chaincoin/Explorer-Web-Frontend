import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import MyWalletServices from '../../../../Services/MyWalletServices';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState(null);

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }


  function handleImport() {
    
    if (file == null){
      alert("Please select a file");
      return;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = function(e) {
      
      var lines = e.target.result.split('\n');

      lines.map((line,index) => {

        if (line.startsWith("#")) return Promise.reject("Line " + (index + 1) + ": comment");
        var lineParts = line.replace(new RegExp(" +", "g"), " ").replace(new RegExp("\r", "g"), "").split(' ');
        if (lineParts.length != 5) return Promise.reject("Line " + (index + 1) + ": invalid line format");

        var name = lineParts[0];
        var output = lineParts[3] + "-" + lineParts[4];
        MyWalletServices.addMyMasternode(name, output);
      })
     debugger;
    };

    reader.readAsBinaryString(file);

  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Import Masternode.conf
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Import Masternode.conf</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please choose your masternode.conf to import into My Masternodes
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
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleImport} color="primary">
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}