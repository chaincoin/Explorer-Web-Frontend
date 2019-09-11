

import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { Card, CardBody, CardHeader } from 'reactstrap';

import { Link } from "react-router-dom";

import BlockchainServices from '../../Services/BlockchainServices';
import ObservableText from '../../Components/ObservableText';
import { map } from 'rxjs/operators';
import ObservableTableList from '../../Components/ObservableTableList';
import ObservableLink from '../../Components/ObservableLink';






const ChainTips = (props) =>{

  const headers = React.useMemo(() =>(
    <React.Fragment>
      <TableCell>Block</TableCell>
      <TableCell>Hash</TableCell>
      <TableCell>Branch Length</TableCell>
      <TableCell>Status</TableCell>
    </React.Fragment>
  ));

  return (
    <Card>
      <CardHeader>
        Chain Tips
      </CardHeader>
      <CardBody>
        <ObservableTableList headers={headers} rowComponent={rowComponent} list={BlockchainServices.chainTips}  />
      </CardBody>
    </Card>
  );
};



const rowComponent = (props) =>{

  const row = props.value;

  return(
    <TableRow >
      <TableCell component="th" scope="row">
        <Link to={"/Explorer/Block/" + row.hash}>
          { row.height }
        </Link>
      </TableCell>
      <TableCell>
        <Link to={"/Explorer/Block/" + row.hash}>
          { row.hash }
        </Link>
      </TableCell>
      <TableCell>
        { row.branchlen }
      </TableCell>
      <TableCell>
        { row.status }
      </TableCell>
    </TableRow>
  )
}


export default ChainTips