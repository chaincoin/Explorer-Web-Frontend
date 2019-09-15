import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";

import TablePaginationActions from '../../Components/TablePaginationActions';

import BlockchainServices from '../../Services/BlockchainServices';
import ObservableTableList from '../../Components/ObservableTableList';


const MemPoolList = (props) =>{

  const headers = React.useMemo(() =>(
    <React.Fragment>
      <TableCell>Hash</TableCell>
      <TableCell>Recipients</TableCell>
    </React.Fragment>
  ));

  return (
    <Card>
      <CardHeader>
        Mem Pool
      </CardHeader>
      <CardBody>
        <ObservableTableList headers={headers} rowComponent={rowComponent} list={BlockchainServices.memPool}  />
      </CardBody>
    </Card>
  );
};



const rowComponent = (props) =>{

  const row = props.value;

  return(
    <TableRow >
      <TableCell><Link to={"/Explorer/Transaction/" + row.txid}>{row.txid}</Link></TableCell>
      <TableCell>{row.vout.length}</TableCell>
    </TableRow>
  )
}


export default MemPoolList

