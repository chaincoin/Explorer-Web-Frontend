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
import { Card, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";

import TablePaginationActions from '../../../Components/TablePaginationActions';


const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
  },
  tableWrapper: {
    overflowX: 'scroll',
    "-webkit-overflow-scrolling": "touch"
  },
});

class TransactionDetailsVin extends React.Component {
  state = {
    page: 0,
    rowsPerPage: 5,
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: event.target.value });
  };

  labelDisplayedRows(){
    return "";
  }

  render() {
    const { classes } = this.props;
    const { rowsPerPage, page } = this.state;
    const { transaction } = this.props; 
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, transaction.vin.length - page * rowsPerPage);

    
//TODO: vin not working with unconfirmed transactions / Extended = false
    return (
      <Card>
        <CardHeader>
          Vin
        </CardHeader>
        <CardBody>
          <Paper className={classes.root}>
            <div className={classes.tableWrapper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>Amount (CHC)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transaction.vin.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(vin =>
                    vin.coinbase == null ?
                    (
                      <TableRow>
                        <TableCell><Link to={"/Explorer/Address/" + vin.address}>{vin.address}</Link></TableCell>
                        <TableCell>{vin.value}</TableCell>
                      </TableRow>
                    ) :
                    (
                      <TableRow>
                        <TableCell>New Coins</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )
                  )}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 48 * emptyRows }}>
                      <TableCell colSpan={2} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              labelRowsPerPage=""
              rowsPerPageOptions={[]}
              labelDisplayedRows={this.labelDisplayedRows}
              colSpan={2}
              count={transaction.vin.length}
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

TransactionDetailsVin.propTypes = {
  classes: PropTypes.object.isRequired,
  transaction: PropTypes.object.isRequired,
};

export default withStyles(styles)(TransactionDetailsVin);