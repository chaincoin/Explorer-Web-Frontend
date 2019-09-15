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

class TransactionDetailsVout extends React.Component {
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

    var vout = transaction.vout.filter(vout => vout.scriptPubKey.addresses != null);

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, vout.length - page * rowsPerPage);

    return (
      <Card>
        <CardHeader>
          Vout
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
                  {vout.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(vout => (
                    <TableRow>
                      <TableCell><Link to={"/Explorer/Address/" + vout.scriptPubKey.addresses[0]}>{vout.scriptPubKey.addresses[0]}</Link></TableCell>
                      <TableCell>{vout.value}</TableCell>
                    </TableRow>
                  ))}
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
              count={vout.length}
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

TransactionDetailsVout.propTypes = {
  classes: PropTypes.object.isRequired,
  transaction: PropTypes.object.isRequired,
};

export default withStyles(styles)(TransactionDetailsVout);