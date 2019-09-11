import React from 'react';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

import { Link } from "react-router-dom";

import MasternodeMenu from '../../../Components/MasternodeMenu';

import AddMyMasternodeDialog from '../../../Components/Dialogs/MyMasternodeDialog';
import ImportMasternodeConfDialog from '../../../Components/Dialogs/ImportMasternodeConfDialog';

import MyWalletServices from '../../../Services/MyWalletServices/MyWalletServices';
import DialogService from '../../../Services/DialogService';
import ObservableTableList from '../../../Components/ObservableTableList';
import BlockchainServices from '../../../Services/BlockchainServices';



var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}



const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  }
});


const MyMasternodes = withStyles(styles)(props =>{

  const list = React.useMemo(() => combineLatest(MyWalletServices.myMasternodes, BlockchainServices.masternodeList).pipe(
    map(([myMasternodes, masternodeList])=> myMasternodes.map(myMn => ({
      myMn:myMn,
      mn: masternodeList == null ? null : masternodeList[myMn.output]
    })))
  ));

  const headers = (
    <React.Fragment>
      <TableCell>Name</TableCell>
      <TableCell>Status</TableCell>
      <TableCell>Last Seen</TableCell>
      <TableCell>Last Paid</TableCell>
      <TableCell></TableCell>
    </React.Fragment>
  )

  return (
    <div>
      <Button variant="contained" color="primary" className={props.classes.button} onClick={() => DialogService.showDialog(AddMyMasternodeDialog).subscribe()}>
        Add Masternode
      </Button>

      <Button variant="contained" color="primary" className={props.classes.button} onClick={() => DialogService.showDialog(ImportMasternodeConfDialog).subscribe()}>
        Import Masternode.conf
      </Button>
      
      
      <ObservableTableList headers={headers} rowComponent={rowComponent} list={list}  />
    </div>
  );
});


const rowComponent = props =>{

  const {myMn, mn} = props.value;
  

  return(
    <TableRow >
      <TableCell component="th" scope="row"><Link to={"/Explorer/MasternodeList/" + myMn.output}>{myMn.name}</Link></TableCell>
      <TableCell>
        {
          mn != null ? 
          mn.status :
          "Not Found"
        }
      </TableCell>
      <TableCell>
        {
          mn != null ? 
          TimeToString(mn.lastseen) :
          "Not Found"
        }
      </TableCell>
      <TableCell>
        {
          mn != null ? 
          TimeToString(mn.lastpaidtime) :
          "Not Found"
        }
      </TableCell>
      <TableCell>
        <MasternodeMenu output={myMn.output} payee={mn != null ? mn.payee : null} />
      </TableCell>
    </TableRow>
  )
}

export default MyMasternodes;

