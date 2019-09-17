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
import { map } from 'rxjs/operators';




const ProposalList = (props) =>{

  const headers = React.useMemo(() =>(
    <React.Fragment>
      <TableCell>Name</TableCell>
      <TableCell>Amount</TableCell>
      <TableCell>Start Date</TableCell>

      <TableCell>End Date</TableCell>
      <TableCell>Yes</TableCell>
      <TableCell>No</TableCell>
      <TableCell>Absolute Yes</TableCell>
      <TableCell>Url</TableCell>
    </React.Fragment>
  ));


  const list = React.useMemo(() => BlockchainServices.gObjectList.pipe(map(gObject => Object.entries(gObject).filter(entry => entry[1].ObjectType == 1))));

  return (
    <Card>
      <CardHeader>
        Proposal List
      </CardHeader>
      <CardBody>
        <ObservableTableList headers={headers} rowComponent={rowComponent} list={list}  />
      </CardBody>
    </Card>
  );
};



const rowComponent = (props) =>{

  const row = props.value;
  const data = JSON.parse(row[1].DataString.replace(/\0/g, ''));
  const proposal = data[0][1];

  return(
    <TableRow >
      <TableCell component="th" scope="row">{proposal.name}</TableCell>
      <TableCell>{proposal.payment_amount}</TableCell>
      <TableCell>{TimeToString(proposal.start_epoch)}</TableCell>
      <TableCell>{TimeToString(proposal.end_epoch)}</TableCell>
      <TableCell>{row[1].YesCount}</TableCell>
      <TableCell>{row[1].NoCount}</TableCell>
      <TableCell>{row[1].AbsoluteYesCount}</TableCell>
      <TableCell><a href={proposal.url} target="blank">{proposal.url}</a></TableCell>
    </TableRow>
  )
}


export default ProposalList






var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}

