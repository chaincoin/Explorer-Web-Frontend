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
  const [importResults, setImportResults] = React.useState(null);

  

  function handleImport() {
    
    if (file == null){
      DialogService.showMessage("Error", "Please select a file").subscribe();
      return;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = function(e) {
      
      var lines = e.target.result.split('\n');

      MyWalletServices.isWalletEncrypted.pipe(
        first(),
        switchMap(walletEncrypted => walletEncrypted == false ? of(null) : GetWalletPasswordObservable)
      ).subscribe(walletPassword => {
        var promises = lines.map((line,index) => {

          if (line.startsWith("#")) return Promise.resolve({
            line: index + 1,
            result: false,
            message: "comment"
          });
  
          var lineParts = line.replace(new RegExp(" +", "g"), " ").replace(new RegExp("\r", "g"), "").split(' ');
          if (lineParts.length != 5) return Promise.resolve({
            line: index + 1,
            result: false,
            message: "invalid line format"
          });
  
          var name = lineParts[0];
          var privateKey = lineParts[2];
          var output = lineParts[3] + "-" + lineParts[4];
          return new Promise((resolve) => MyWalletServices.addMyMasternode(name, output, walletPassword == null ? privateKey : null,  walletPassword == null ? null : MyWalletServices.encrypt(walletPassword, privateKey))
            .then(() => resolve({
              line: index + 1,
              result: true,
              message: "added successfully"
            }))
            .catch((err) => resolve({
              line: index + 1,
              result: false,
              message: "failed - " + (err || "unknown")
            })));
        });
  
        Promise.all(promises).then(results => setImportResults(results));
      })

      

    };

    reader.readAsBinaryString(file);

  }

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
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

        {
          importResults != null ? (<Paper>
            Import Results
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Line</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importResults.map(row => (
                  <TableRow>
                    <TableCell>{row.line}</TableCell>
                    <TableCell>{row.result ? "complete" : "failed"}</TableCell>
                    <TableCell>{row.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>)
          : null
        }
        

      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleImport} color="primary">
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}