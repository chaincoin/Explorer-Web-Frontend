import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { Card, CardBody, CardHeader } from 'reactstrap';

import BlockchainServices from '../../Services/BlockchainServices';
import ObservableTableList from '../../Components/ObservableTableList';





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}





const BannedList = (props) =>{

  const headers =  React.useMemo(() =>(
    <React.Fragment>
      <TableCell>Address</TableCell>
      <TableCell>Ban Created</TableCell>
      <TableCell>Banned Until</TableCell>
      <TableCell>Ban Reason</TableCell>
    </React.Fragment>
  ));

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

  const row = props.value;

  return(
    <TableRow >
      <TableCell component="th" scope="row">
        {row.address}
      </TableCell>
      <TableCell>
        {TimeToString(row.ban_created)}
      </TableCell>
      <TableCell>
        {TimeToString(row.banned_until)}
      </TableCell>
      <TableCell>
        {row.ban_reason}
      </TableCell>
    </TableRow>
  )
}


export default BannedList