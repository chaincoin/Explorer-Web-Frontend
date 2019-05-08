import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";

import TablePaginationActions from '../../../Components/TablePaginationActions';

import BlockchainServices from '../../../Services/BlockchainServices';


const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class AddressDetailsTransactions extends React.Component {
  state = {
    rows: [],
    page: 0,
    rowsPerPage: 10,
    loading:true,
    error: null
  };

  handleChangePage = (event, page) => {
    this.setState({ page },this.getTransactions);
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: event.target.value },this.getTransactions);
  };

  componentDidMount() {
    this.getTransactions();
  }

  componentDidUpdate(prevProps) {
    if (this.props.address  != prevProps.address) this.getTransactions();
  }

  getTransactions(){
    var address = this.props.address;
    var pos = address.txCount - (this.state.page * this.state.rowsPerPage);
    var rowsPerPage = pos < this.state.rowsPerPage ? pos : this.state.rowsPerPage;

    BlockchainServices.getAddressTxs(address.address,pos, rowsPerPage)
      .then(
        (results) => {
          this.setState({
            loading: false,
            rows: results
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            loading: false,
            error
          });
        }
      )
  }

  labelDisplayedRows(){
    return "";
  }

  render() {
    const { classes } = this.props;
    const { rows, rowsPerPage, page } = this.state;
    const { address } = this.props; 
    const emptyRows = rowsPerPage - rows.length;

    return (
      <Card>
        <CardHeader>
          Transactions
        </CardHeader>
        <CardBody>
          <Paper className={classes.root}>
            <div className={classes.tableWrapper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Hash</TableCell>
                    <TableCell>Amount (CHC)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{TimeToString(row.time)}</TableCell>
                      <TableCell><Link to={"/Explorer/Transaction/" + row.txid}>{row.txid}</Link></TableCell>
                      <TableCell>{row.value}</TableCell>
                    </TableRow>
                  ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 48 * emptyRows }}>
                      <TableCell colSpan={3} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              labelRowsPerPage=""
              rowsPerPageOptions={[]}
              labelDisplayedRows={this.labelDisplayedRows}
              colSpan={3}
              count={address.txCount}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                native: true,
              }}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </Paper>
        </CardBody>
      </Card>
      
    );
  }
}

AddressDetailsTransactions.propTypes = {
  classes: PropTypes.object.isRequired,
  address: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddressDetailsTransactions);



var TimeToString = (timestamp) =>{ //TODO: make this an include
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}
