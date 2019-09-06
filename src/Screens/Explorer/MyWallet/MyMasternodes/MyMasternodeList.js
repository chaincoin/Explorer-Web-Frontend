import React from 'react';
import { combineLatest, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import { Link } from "react-router-dom";

import AddMyMasternodeDialog from '../../../../Components/Dialogs/MyMasternodeDialog';
import ImportMasternodeConfDialog from '../../../../Components/Dialogs/ImportMasternodeConfDialog';


import TablePaginationActions from '../../../../Components/TablePaginationActions';
import MasternodeMenu from '../../../../Components/MasternodeMenu';


import BlockchainServices from '../../../../Services/BlockchainServices';
import MyWalletServices from '../../../../Services/MyWalletServices/MyWalletServices';
import DialogService from '../../../../Services/DialogService';
import ObservableLink from '../../../../Components/ObservableLink';
import ObservableText from '../../../../Components/ObservableText';
import ObservableTableList from '../../../../Components/ObservableTableList';






var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}



const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  }
});


const MyAddresses = (props) =>{

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
      
      
      <ObservableTableList headers={headers} rowComponent={rowComponent} list={MyWalletServices.myMasternodes}  />
    </div>
  );
};


const rowComponent = (props) =>{


  return(
    <TableRow >
      <TableCell>
        <ObservableLink value={props.value.pipe(map(myMn => {
                if (myMn == null) return "";
                return "/Explorer/MasternodeList/" + myMn.output;
              }))}>
          <ObservableText value={props.value.pipe(map(myMn => {
                if (myMn == null) return "";
                return myMn.name
              }))} />
        </ObservableLink>
      </TableCell>
      <TableCell>
      <ObservableText value={props.value.pipe(switchMap(myMn => {
              if (myMn == null) return of("Missing");
              return myMn.status;
          }))} />
      </TableCell>
      <TableCell>
        <ObservableText value={props.value.pipe(switchMap(myMn => {
                if (myMn == null) return of("");
                return myMn.data;
            }),
            map(data => TimeToString(data.lastseen)))} />
      </TableCell>
      
      <TableCell>
        <ObservableText value={props.value.pipe(switchMap(myMn => {
              if (myMn == null) return of("");
              return myMn.data;
          }),
          map(data => TimeToString(data.lastpaidtime)))} />
      </TableCell>
      <TableCell>
        
      </TableCell>
    </TableRow>
  )
}

export default withStyles(styles)(MyAddresses);

