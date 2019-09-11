
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

import { Link } from "react-router-dom";


import AddressMenu from '../../../../Components/AddressMenu';

import CreateAddressDialog from '../../../../Components/Dialogs/CreateMyAddressDialog';
import WatchAddressDialog from '../../../../Components/Dialogs/WatchAddressDialog'
import ImportWifDialog from '../../../../Components/Dialogs/ImportWifDialog';


import BlockchainServices from '../../../../Services/BlockchainServices';
import MyWalletServices from '../../../../Services/MyWalletServices/MyWalletServices';
import DialogService from '../../../../Services/DialogService';
import { switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import ObservableText from '../../../../Components/ObservableText';
import ObservableTableList from '../../../../Components/ObservableTableList';
import ObservableLink from '../../../../Components/ObservableLink';



const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  }
});


const MyAddresses = (props) =>{

  const headers = (
    <React.Fragment>
      <TableCell>Name</TableCell>
      <TableCell>Address</TableCell>
      <TableCell>Balance (CHC)</TableCell>
      <TableCell></TableCell>
    </React.Fragment>
  )

  return (
    <div>
      <Button variant="contained" color="primary" className={props.classes.button} onClick={() => DialogService.showDialog(CreateAddressDialog).subscribe()}>
        Create Address
      </Button>

      <Button variant="contained" color="primary" className={props.classes.button} onClick={() => DialogService.showDialog(WatchAddressDialog).subscribe()}>
        Watch Address
      </Button>
      <Button variant="contained" color="primary" className={props.classes.button} onClick={() => DialogService.showDialog(ImportWifDialog).subscribe()}>
        Import WIF
      </Button>
      
      
      <ObservableTableList headers={headers} rowComponent={rowComponent} list={MyWalletServices.myAddresses}  />
    </div>
  );
};


const rowComponent = (props) =>{


  return(
    <TableRow >
      <TableCell>
        {props.value.name}
      </TableCell>
      <TableCell component="th" scope="row"><Link to={"/Explorer/Address/" + props.value.address}>{props.value.address}</Link></TableCell>
      <TableCell>
        <ObservableText value={props.value.balance.pipe(map(balance => {
              if (balance == null) return "0";
              return balance;
          }))} />
      </TableCell>
      <TableCell>
        <AddressMenu address={props.value.address} />
      </TableCell>
    </TableRow>
  )
}

export default withStyles(styles)(MyAddresses);





