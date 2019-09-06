

import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { Card, CardBody, CardHeader } from 'reactstrap';


import BlockchainServices from '../../Services/BlockchainServices';
import ObservableText from '../../Components/ObservableText';
import { map } from 'rxjs/operators';
import ObservableTableList from '../../Components/ObservableTableList';
import ObservableLink from '../../Components/ObservableLink';






const ChainTips = (props) =>{

  const headers = (
    <React.Fragment>
      <TableCell>Block</TableCell>
      <TableCell>Hash</TableCell>
      <TableCell>Branch Length</TableCell>
      <TableCell>Status</TableCell>
    </React.Fragment>
  )

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


  return(
    <TableRow >
      <TableCell component="th" scope="row">
        <ObservableLink value={props.value.pipe(map(row => {
            if (row == null) return "";
            return "/Explorer/Block/" + row.hash;
          }))} >
          <ObservableText value={props.value.pipe(map(row => {
              if (row == null) return "";
              return row.height;
            }))} />
        </ObservableLink>
       
      </TableCell>
      <TableCell>
        <ObservableLink value={props.value.pipe(map(row => {
            if (row == null) return "";
            return "/Explorer/Block/" + row.hash;
          }))} >
          <ObservableText value={props.value.pipe(map(row => {
              if (row == null) return "";
              return row.hash;
            }))} />
        </ObservableLink>
      </TableCell>
      <TableCell>
        <ObservableText value={props.value.pipe(map(row => {
            if (row == null) return "";
            return row.branchlen
          }))} />
      </TableCell>
      <TableCell>
        <ObservableText value={props.value.pipe(map(row => {
            if (row == null) return "";
            return row.status
          }))} />
      </TableCell>
    </TableRow>
  )
}


export default ChainTips