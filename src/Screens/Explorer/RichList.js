import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";


import AddressMenu from '../../Components/AddressMenu';

import { shareReplay, switchMap } from 'rxjs/operators';
import { combineLatest, BehaviorSubject } from 'rxjs';
import BlockchainServices from '../../Services/BlockchainServices';
import ObservableTable from '../../Components/ObservableTable';





const RichList = (props) =>{

  var page = React.useMemo(() => new BehaviorSubject(0));
  var rowsPerPage =  React.useMemo(() => new BehaviorSubject(10));

  var pageData =  React.useMemo(() =>combineLatest(BlockchainServices.richListCount, page, rowsPerPage).pipe(switchMap(([richListCount, page, rowsPerPage]) =>{
    var pos = page * rowsPerPage;
    return BlockchainServices.getRichList(pos, rowsPerPage);
  }),
  shareReplay({
      bufferSize: 1,
      refCount: true
  })))


  const headers =  React.useMemo(() =>(
    <React.Fragment>
      <TableCell>Address</TableCell>
      <TableCell>Last Activity</TableCell>
      <TableCell>Balance (CHC)</TableCell>
      <TableCell></TableCell>
    </React.Fragment>
  ));

  return (
    <Card>
      <CardHeader>
        Rich List
      </CardHeader>
      <CardBody>
        <ObservableTable headers={headers} rowComponent={rowComponent} list={pageData} page={page} count={BlockchainServices.richListCount} rowsPerPage={rowsPerPage}/>
      </CardBody>
    </Card>
  )
}


var rowComponent = (props) =>{
  const row = props.value;

  return(
    <TableRow key={row.id}>
      <TableCell component="th" scope="row"><Link to={"/Explorer/Address/" + row.address}>{row.label == null ? row.address : row.label + " " +  row.address}</Link></TableCell>
      <TableCell>{TimeToString(row.lastActivity)}</TableCell>
      <TableCell>{row.balance}</TableCell>
      <TableCell><AddressMenu address={row.address} /></TableCell>
    </TableRow>
  )
}



export default RichList;


var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}