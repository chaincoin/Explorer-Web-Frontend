import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { Card, CardBody, CardHeader } from 'reactstrap';

import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

import ObservableTableList from '../../Components/ObservableTableList';
import BlockchainServices from '../../Services/BlockchainServices';





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

  const subHeaders = React.useMemo(() =>( // eslint-disable-line
    <React.Fragment>
      <TableCell width="390">MN</TableCell>
      <TableCell>Votes</TableCell>
      <TableCell>Status</TableCell>
    </React.Fragment>
  ));

  const subList = React.useMemo(() => new BehaviorSubject(props.value[1].split(",")),[props.value]); // eslint-disable-line

  const rowsPerPage = React.useMemo(() => new BehaviorSubject(0)); // eslint-disable-line

  return(
    <TableRow >
      <TableCell component="th" scope="row">
       {props.value[0]}
      </TableCell>
      <TableCell>
        <ObservableTableList headers={subHeaders} rowComponent={subRowComponent} list={subList} rowsPerPage={rowsPerPage} />
      </TableCell>
    </TableRow>
  )
}




const subRowComponent = (props) =>{

 
  if (props.value == "Unknown") return (
    <TableRow >
      <TableCell width="390">{props.value}</TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
    </TableRow>
  );

  var split = props.value.split(":");
  var votes = parseInt(split[1]);
  return (
    <TableRow >
      <TableCell width="390">
        {split[0]}
      </TableCell>
      <TableCell>{votes}</TableCell>
      <TableCell>{ votes >= 6 ? "Enforced": (6 - votes) + " votes to enforce"}</TableCell>
    </TableRow>
  );
}

export default MasternodeWinners