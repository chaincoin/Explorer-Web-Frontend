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

import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";

import TablePaginationActions from '../../Components/TablePaginationActions';

import BlockDetailsTransactions from './BlockDetails/BlockDetailsTransactions';

import BlockchainServices from '../../Services/BlockchainServices';
import { switchMap, map, shareReplay } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import ObservableTable from '../../Components/ObservableTable';
import ObservableBoolean from '../../Components/ObservableBoolean';
import ObservableText from '../../Components/ObservableText';
import ObservableLink from '../../Components/ObservableLink';




const BlockList = (props) =>{

  var page = React.useMemo(() => new BehaviorSubject(0));
  var rowsPerPage =  React.useMemo(() => new BehaviorSubject(10));

  var pageData =  React.useMemo(() =>combineLatest(BlockchainServices.blockCount, page, rowsPerPage).pipe(switchMap(([blockCount, page, rowsPerPage]) =>{
    var blockPos = blockCount - (page * rowsPerPage);
    return BlockchainServices.getBlocks(blockPos,blockPos < rowsPerPage ? blockPos : rowsPerPage);
  }),
  shareReplay({
      bufferSize: 1,
      refCount: true
  })))


  const headers =  React.useMemo(() =>(
    <React.Fragment>
      <TableCell>Block</TableCell>
      <TableCell>Hash</TableCell>
      <TableCell>Recipients</TableCell>
      <TableCell>Amount (CHC)</TableCell>
      <TableCell>Timestamp</TableCell>
    </React.Fragment>
  ));

  return (
    <Card>
      <CardHeader>
        Blocks
      </CardHeader>
      <CardBody>
        <ObservableTable headers={headers} rowComponent={rowComponent} list={pageData} page={page} count={BlockchainServices.blockCount} rowsPerPage={rowsPerPage}/>
      </CardBody>
    </Card>
  )
}



var rowComponent = (props) =>{
  const row = props.value;

  return(
    <React.Fragment>
      <TableRow>
        <TableCell component="th" scope="row"><Link to={"/Explorer/Block/" + row.hash}>{row.height}</Link></TableCell>
        <TableCell><Link to={"/Explorer/Block/" + row.hash}>{row.hash}</Link></TableCell>
        <TableCell>{row.tx.map(tx => tx.recipients).reduce(add)}</TableCell>
        <TableCell>{row.value}</TableCell>
        <TableCell>{TimeToString(row.time)}</TableCell>
      </TableRow>
    </React.Fragment>
    
  )
}

export default BlockList;





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}


function add(accumulator, a) {

  if (accumulator == null || a == null) return null
  return accumulator + a;
}