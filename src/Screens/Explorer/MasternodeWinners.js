import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { Card, CardBody, CardHeader } from 'reactstrap';

import BlockchainServices from '../../Services/BlockchainServices';
import ObservableText from '../../Components/ObservableText';
import { map } from 'rxjs/operators';
import ObservableTableList from '../../Components/ObservableTableList';
import ObservableBoolean from '../../Components/ObservableBoolean';
import { BehaviorSubject } from 'rxjs';


const MasternodeWinners = (props) =>{

  const headers = (
    <React.Fragment>
      <TableCell>Block</TableCell>
      <TableCell></TableCell>
    </React.Fragment>
  )

  return (
    <Card>
      <CardHeader>
        Chain Tips
      </CardHeader>
      <CardBody>
        <ObservableTableList headers={headers} rowComponent={rowComponent} list={BlockchainServices.masternodeWinners.pipe(map(winners => Object.entries(winners)))}  />
      </CardBody>
    </Card>
  );
};




const rowComponent = (props) =>{

  const headers = (
    <React.Fragment>
      <TableCell width="390">MN</TableCell>
      <TableCell>Votes</TableCell>
      <TableCell>Status</TableCell>
    </React.Fragment>
  )

  return(
    <TableRow >
      <TableCell component="th" scope="row">
        <ObservableText value={props.value.pipe(map(row => {
              if (row == null) return "";
              return row[0];
            }))} />
       
      </TableCell>
      <TableCell>
        <ObservableTableList headers={headers} rowComponent={subRowComponent} list={props.value.pipe(map(row => row[1].split(",")))} rowsPerPage={new BehaviorSubject(0)} />
      </TableCell>
    </TableRow>
  )
}




const subRowComponent = (props) =>{

  const headers = (
    <React.Fragment>
      <TableCell width="390">MN</TableCell>
      <TableCell>Votes</TableCell>
      <TableCell>Status</TableCell>
    </React.Fragment>
  )

  return(
    <React.Fragment>
      <ObservableBoolean value={props.value.pipe(map(row => {
                  if (row == null) return false;
                  return row == "Unknown";
                }))}>
        <TableRow >
          <TableCell width="390">
            <ObservableText value={props.value.pipe(map(row => {
                    if (row == null) return "";
                    return row;
                  }))} />
          </TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      </ObservableBoolean>

      <ObservableBoolean value={props.value.pipe(map(row => {
                  if (row == null) return false;
                  return row != "Unknown";
                }))}>
        <TableRow >
          <TableCell width="390">
            <ObservableText value={props.value.pipe(map(row => {
                    if (row == null) return "";
                    return row.split(":")[0];
                  }))} />
          </TableCell>
          <TableCell>
            <ObservableText value={props.value.pipe(map(row => {
                    if (row == null) return "";
                    return row.split(":")[1];
                  }))} />
          </TableCell>
          <TableCell>
            <ObservableText value={props.value.pipe(map(row => {
                    if (row == null) return "";
                    var votes = parseInt(row.split(":")[1]);
                    return votes >= 6 ? "Enforced": (6 - votes) + " votes to enforce";
                  }))} />
          </TableCell>
        </TableRow>
      </ObservableBoolean>
    </React.Fragment>
    
  )
}

export default MasternodeWinners