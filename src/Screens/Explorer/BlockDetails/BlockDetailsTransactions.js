import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";

import TablePaginationActions from '../../../Components/TablePaginationActions';

import ObservableText from '../../../Components/ObservableText';
import { map, distinctUntilChanged } from 'rxjs/operators';
import ObservableBoolean from '../../../Components/ObservableBoolean';
import ObservableTableList from '../../../Components/ObservableTableList';




const BlockDetailsTransactions = (props) =>{


  var headers = (
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
        <ObservableTableList headers={headers} rowComponent={row} list={props.block.pipe(map(block => block.tx))}  />
      </CardBody>
    </Card>
    
  );
}

export default BlockDetailsTransactions;





var row = (props) =>{

  return(
    <React.Fragment>
      <ObservableBoolean value={props.value.pipe(map(tx => tx != null))} >
        <TableRow>
          <TableCell>
            <ObservableText value={props.value.pipe(map(tx => {
              if (tx == null) return "";
              return tx.txid == null ? tx : tx.txid
            }))} />
          </TableCell>
          <TableCell>
            <ObservableText value={props.value.pipe(map(tx => {
              if (tx == null) return "";
              return tx.recipients;
            }))} />
          </TableCell>
          <TableCell>
            <ObservableText value={props.value.pipe(map(tx => {
              if (tx == null) return "";
              return tx.value;
            }))} />
          </TableCell>
        </TableRow>
      </ObservableBoolean>


    </React.Fragment>
    
  )
}


