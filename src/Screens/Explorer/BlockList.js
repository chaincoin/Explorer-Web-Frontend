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

  var page = new BehaviorSubject(0);
  var rowsPerPage = new BehaviorSubject(10);

  var pageData = combineLatest(BlockchainServices.blockCount, page, rowsPerPage).pipe(switchMap(([blockCount, page, rowsPerPage]) =>{
    var blockPos = blockCount - (page * rowsPerPage);
    return BlockchainServices.getBlocks(blockPos,blockPos < rowsPerPage ? blockPos : rowsPerPage);
  }),
  shareReplay({
      bufferSize: 1,
      refCount: true
  }))


  const headers = (
    <React.Fragment>
      <TableCell>Block</TableCell>
      <TableCell>Hash</TableCell>
      <TableCell>Recipients</TableCell>
      <TableCell>Amount (CHC)</TableCell>
      <TableCell>Timestamp</TableCell>
    </React.Fragment>
  );

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

  return(
    <React.Fragment>
      <ObservableBoolean value={props.value.pipe(map(tx => tx != null))} >
        <TableRow>
          <TableCell component="th" scope="row">
            <ObservableLink value={props.value.pipe(map(block => {
                    if (block == null) return "";
                    return "/Explorer/Block/" + block.hash;
                  }))}>
              <ObservableText value={props.value.pipe(map(block => {
                if (block == null) return "";
                return block.height;
                }))} />
            </ObservableLink>
          </TableCell>
          <TableCell>
            <ObservableLink value={props.value.pipe(map(block => {
                  if (block == null) return "";
                  return "/Explorer/Block/" + block.hash;
                }))}>
              <ObservableText value={props.value.pipe(map(block => {
                  if (block == null) return "";
                  return block.hash;
                }))} />
            </ObservableLink>
          </TableCell>
          <TableCell>
            <ObservableText value={props.value.pipe(map(block => {
                  if (block == null) return "";
                  return block.tx.map(tx => tx.recipients).reduce(add);
                }))} />
          </TableCell>
          <TableCell>
            <ObservableText value={props.value.pipe(map(block => {
                if (block == null) return "";
                return block.value;
              }))} />
          </TableCell>
          <TableCell>
            <ObservableText value={props.value.pipe(map(block => {
                if (block == null) return "";
                return TimeToString(block.time);
              }))} />
          </TableCell>
        </TableRow>
      </ObservableBoolean>
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