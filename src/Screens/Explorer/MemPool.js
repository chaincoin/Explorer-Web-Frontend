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

class MemPoolList extends React.Component {
  state = {
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 10,
    loading: true,
    windowWidth: 0,
    error: null,

    searchInput:""
  };

  rawMemPoolSubscription = null;

  handleChangePage = (event, page) => {
    this.setState({ page });
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

  componentDidMount() {
    this.rawMemPoolSubscription = BlockchainServices.rawMemPool.subscribe((memPool) =>{
      this.setState({
        rows: memPool
      });
    });
  }

  componentWillUnmount() {
    this.rawMemPoolSubscription.unsubscribe();
  }

  handleSearch = (event) => {
    this.setState({ searchInput: event.target.value });
  }
  
  labelDisplayedRows(){
    return "";
  }
 
  render() {
    const { classes } = this.props;
    const { rowsPerPage, page } = this.state;
    var { rows, searchInput } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    if (searchInput != "")
    {
      searchInput = searchInput.toLowerCase();
      rows = rows.slice(0).filter(row => {
        return row.txid.indexOf(searchInput) > -1
      });
    }

    return (
      <Card>
        <CardHeader>
          Mem Pool
        </CardHeader>
        <CardBody>
          <TextField
            id="standard-name"
            label="Search"
            className={classes.textField}
            value={this.state.searchInput}
            onChange={this.handleSearch}
            margin="normal"
            fullWidth
          />
          <Paper>
            <div className={classes.tableWrapper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Hash</TableCell>
                    <TableCell>Recipients</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                    <TableRow >
                      <TableCell><Link to={"/Explorer/Transaction/" + row.txid}>{row.txid}</Link></TableCell>
                      <TableCell>{row.vout.length}</TableCell>
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
              count={rows.length}
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


MemPoolList.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(MemPoolList);





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}



function add(accumulator, a) {
  return accumulator + a;
}