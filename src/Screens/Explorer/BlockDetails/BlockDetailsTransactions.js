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


const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class BlockDetailsTransactions extends React.Component {
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
    const { block } = this.props; 
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, block.tx.length - page * rowsPerPage);

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
                    <TableCell>Hash</TableCell>
                    <TableCell>Recipients</TableCell>
                    <TableCell>Amount (CHC)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {block.tx.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell><Link to={"/Explorer/Transaction/" + (block.extended == true ? tx.txid : tx)}>{(block.extended == true ? tx.txid : tx)}</Link></TableCell>
                      <TableCell>{tx.recipients}</TableCell>
                      <TableCell>{tx.value}</TableCell>
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
              count={block.tx.length}
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

BlockDetailsTransactions.propTypes = {
  classes: PropTypes.object.isRequired,
  block: PropTypes.object.isRequired,
};

export default withStyles(styles)(BlockDetailsTransactions);