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
    overflowX: 'scroll',
    "-webkit-overflow-scrolling": "touch"
  },
});

class MasternodeDetailsEvents extends React.Component {
  state = {
    rows: [],
    page: 0,
    rowsPerPage: 5,
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
    this.getEvents();
  }

  componentDidUpdate(prevProps) {
    if (this.props.output  != prevProps.output) this.getEvents();
  }

  getEvents(){
    var output = this.props.output;
    var masternode = this.props.masternode;
    var pos = masternode.eventCount - (this.state.page * this.state.rowsPerPage);
    var rowsPerPage = pos < this.state.rowsPerPage ? pos : this.state.rowsPerPage;

    BlockchainServices.getMasternodeEvents(output, pos, rowsPerPage)
      .then(
        (results) => {
          this.setState({
            loading: false,
            rows: results
          });
        },
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
    const { masternode } = this.props; 
    const emptyRows = rowsPerPage - rows.length;

    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Info</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{TimeToString(row.time)}</TableCell>
                  <TableCell>{row.event}</TableCell>
                  <TableCell>{eventToInfo(row)}</TableCell>
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
          count={masternode.eventCount}
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
      
    );
  }
}




MasternodeDetailsEvents.propTypes = {
  classes: PropTypes.object.isRequired,
  masternode: PropTypes.object.isRequired,
};

export default withStyles(styles)(MasternodeDetailsEvents);



var TimeToString = (timestamp) =>{ //TODO: make this an include
  var d = new Date(timestamp );
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}


var eventToInfo = (event) =>
{
  if (event.event == "changedMasternode"){
    return "Status changed from " + event.oldStatus + " to " + event.newStatus;
  }
}