import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';



export default (props) => {

  React.useEffect(() => {
    return () => {
    };
  }, []);




  return (
    <React.Fragment>
      <Dialog
        open={true}
        onClose={() =>props.onError("Cancelled by user")}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={e => props.onClose(true)} color="primary" autoFocus>
            Okay
          </Button>
          <Button onClick={e => props.onClose(false)} color="primary" autoFocus>
            No
          </Button>
          <Button onClick={e => props.onError("Cancelled by user")} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}