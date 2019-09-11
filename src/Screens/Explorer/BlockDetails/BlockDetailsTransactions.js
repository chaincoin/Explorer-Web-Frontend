import React from 'react';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { Card, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";


import { map  } from 'rxjs/operators';
import ObservableTableList from '../../../Components/ObservableTableList';




const BlockDetailsTransactions = (props) =>{

  const list = React.useMemo(()=> props.block.pipe(map(block => block.tx)),[props.block]);

  const headers = (
    <React.Fragment>
      <TableCell>Hash</TableCell>
      <TableCell>Recipients</TableCell>
      <TableCell>Amount (CHC)</TableCell>
    </React.Fragment>
  )


  return (
    <Card>
      <CardHeader>
        Transactions
      </CardHeader>
      <CardBody>
        <ObservableTableList headers={headers} rowComponent={row} list={list}  />
      </CardBody>
    </Card>
    
  );
}

export default BlockDetailsTransactions;





var row = (props) =>{

  return(
    <React.Fragment>
      <TableRow key={props.value.id}>
        <TableCell><Link to={"/Explorer/Transaction/" + (props.value.txid != null ? props.value.txid : props.value)}>{(props.value.txid != null ? props.value.txid : props.value)}</Link></TableCell>
        <TableCell>{props.value.recipients}</TableCell>
        <TableCell>{props.value.value}</TableCell>
      </TableRow>
    </React.Fragment>
    
  )
}


