import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import TablePaginationActions from '../../Components/TablePaginationActions';


import BlockchainServices from '../../Services/BlockchainServices';
import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';
import ObservableTableList from '../../Components/ObservableTableList';




const PeersList = (props) =>{

  const headers = React.useMemo(() =>(
    <React.Fragment>
      <TableCell>Address</TableCell>
      <TableCell>Connection Time</TableCell>
      <TableCell>Version</TableCell>
    </React.Fragment>
  ));

  return (
    <Card>
      <CardHeader>
        Peer List
      </CardHeader>
      <CardBody>
        <ObservableTableList headers={headers} rowComponent={rowComponent} list={BlockchainServices.peerInfo}  />
      </CardBody>
    </Card>
  );
};



const rowComponent = (props) =>{

  const row = props.value;

  return(
    <TableRow >
      <TableCell component="th" scope="row">{row.addr}</TableCell>
      <TableCell>{TimeToString(row.conntime)}</TableCell>
      <TableCell>{row.version}</TableCell>
    </TableRow>
  )
}


export default PeersList






var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}

