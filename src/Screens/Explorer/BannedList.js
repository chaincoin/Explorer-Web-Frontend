import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { Card, CardBody, CardHeader } from 'reactstrap';


import BlockchainServices from '../../Services/BlockchainServices';
import ObservableText from '../../Components/ObservableText';
import { map } from 'rxjs/operators';
import ObservableTableList from '../../Components/ObservableTableList';





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}





const BannedList = (props) =>{

  const headers = (
    <React.Fragment>
      <TableCell>Address</TableCell>
      <TableCell>Ban Created</TableCell>
      <TableCell>Banned Until</TableCell>
      <TableCell>Ban Reason</TableCell>
    </React.Fragment>
  )

  return (
    <Card>
      <CardHeader>
        Banned List
      </CardHeader>
      <CardBody>
        <ObservableTableList headers={headers} rowComponent={rowComponent} list={BlockchainServices.bannedList}  />
      </CardBody>
    </Card>
  );
};


const rowComponent = (props) =>{


  return(
    <TableRow >
      <TableCell component="th" scope="row">
        <ObservableText value={props.value.pipe(map(row => {
            if (row == null) return "";
            return row.address
          }))} />
      </TableCell>
      <TableCell>
        <ObservableText value={props.value.pipe(map(row => {
            if (row == null) return "";
            return TimeToString(row.ban_created)
          }))} />
      </TableCell>
      <TableCell>
        <ObservableText value={props.value.pipe(map(row => {
            if (row == null) return "";
            return TimeToString(row.banned_until)
          }))} />
      </TableCell>
      <TableCell>
        <ObservableText value={props.value.pipe(map(row => {
            if (row == null) return "";
            return row.ban_reason
          }))} />
      </TableCell>
    </TableRow>
  )
}


export default BannedList