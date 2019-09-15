import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';


import { Card, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";


import MasternodeMenu from '../../Components/MasternodeMenu'

import BlockchainServices from '../../Services/BlockchainServices';
import { BehaviorSubject, combineLatest } from 'rxjs';
import ObservableTableList from '../../Components/ObservableTableList';
import { map } from 'rxjs/operators';
import ObservableTextInput from '../../Components/ObservableTextInput';



var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}






const MasternodeList = (props) =>{


  const searchInputObservable = React.useMemo(() => new BehaviorSubject(""));

  const list = React.useMemo(() => combineLatest(BlockchainServices.masternodeList, searchInputObservable)
  .pipe(map(([masternodeList, searchInput]) =>{
    if (searchInput == null || searchInput == "") return Object.entries(masternodeList);
    return Object.entries(masternodeList).filter(row => {
      return row[0].toLowerCase().indexOf(searchInput) > -1 || 
      row[1].payee.toLowerCase().indexOf(searchInput) > -1 ||
      row[1].address.toLowerCase().indexOf(searchInput) > -1 ||
      row[1].status.toLowerCase().indexOf(searchInput) > -1;
    });
  })))
  


  const headers = React.useMemo(() =>(
    <React.Fragment>
      <TableCell>Address</TableCell>
      <TableCell>Payee</TableCell>
      <TableCell>Status</TableCell>
      <TableCell>Last Seen</TableCell>
      <TableCell></TableCell>
    </React.Fragment>
  ));

  return (
    <Card>
      <CardHeader>
        Masternodes
      </CardHeader>
      <CardBody>
        <ObservableTextInput value={searchInputObservable} />
        <ObservableTableList headers={headers} rowComponent={rowComponent} list={list} />
      </CardBody>
    </Card>
  )
}



var rowComponent = (props) =>{
  const row = props.value;

  return(
    <TableRow >
      <TableCell component="th" scope="row"><Link to={"/Explorer/MasternodeList/" + row[0]}>{row[1].address}</Link></TableCell>
      <TableCell><Link to={"/Explorer/Address/" + row[1].payee}>{row[1].payee}</Link></TableCell>
      <TableCell>{row[1].status}</TableCell>
      <TableCell>{TimeToString(row[1].lastseen)}</TableCell>
      <TableCell>
        <MasternodeMenu output={row[0]} payee={row[1].payee} />
      </TableCell>
    </TableRow>
    
  )
}



export default MasternodeList