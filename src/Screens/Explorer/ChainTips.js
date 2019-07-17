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

import { Link } from "react-router-dom";

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import TablePaginationActions from '../../Components/TablePaginationActions';


import BlockchainServices from '../../Services/BlockchainServices';
import MyWalletServices from '../../Services/MyWalletServices';



const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'scroll',
    "-webkit-overflow-scrolling": "touch"
  },
});

class PeerList extends React.Component {
  state = {
    tab: 0,
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 10,
    error: null,

    searchInput: "",

    menuAnchorEl: []
  };

  masternodeListSubscription = null;

  handleChangePage = (event, page) => {
    this.setState({ page });
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

  componentDidMount() {
    this.subscription = BlockchainServices.chainTips.subscribe((chainTips) =>{
      this.setState({
        rows: chainTips
      });
    });
  }

  componentWillUnmount = () => {
    this.subscription.unsubscribe();
  }

  labelDisplayedRows(){
    return "";
  }
 
  render() {
    const { classes } = this.props;
    const { rowsPerPage, page, tab } = this.state;
    var { rows } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);


    return (
      <Card>
        <CardHeader>
          Chain Tips
        </CardHeader>
        <CardBody>
          <Paper>

          <div className={classes.tableWrapper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Block</TableCell>
                  <TableCell>Hash</TableCell>
                  <TableCell>Branch Length</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowPos) => (
                  <TableRow >
                    <TableCell component="th" scope="row"><Link to={"/Explorer/Block/" + row.hash}>{row.height}</Link></TableCell>
                    <TableCell><Link to={"/Explorer/Block/" + row.hash}>{row.hash}</Link></TableCell>
                    <TableCell>{row.branchlen}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 48 * emptyRows }}>
                    <TableCell colSpan={4} />
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


PeerList.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(PeerList);





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}

