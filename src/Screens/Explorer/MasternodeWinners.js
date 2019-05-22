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
    overflowX: 'scroll',
    "-webkit-overflow-scrolling": "touch"
  },
});

class MasternodeWinners extends React.Component {
  state = {
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 10,
    loading: true,
    error: null
  };

  masternodeWinnersSubscription = null;

  handleChangePage = (event, page) => {
    this.setState({ page });
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

  componentDidMount() {
    this.masternodeWinnersSubscription = BlockchainServices.masternodeWinners.subscribe((masternodeWinners) =>{
      this.setState({
        rows: Object.entries(masternodeWinners)
      });
    });
  }

  componentWillUnmount() {
    this.masternodeWinnersSubscription.unsubscribe();
  }


  labelDisplayedRows(){
    return "";
  }
 
  render() {
    const { classes } = this.props;
    const { rows, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    
//TODO: Work out if the block has been mined and create link if it has been
    return ( 
      <Card>
        <CardHeader>
          Masternode Winners
        </CardHeader>
        <CardBody>
          <Paper>
            <div className={classes.tableWrapper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Block</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => 
                    {
                      var votedMNs = row[1].split(",");
                      
                      return (
                        <TableRow >
                          <TableCell component="th" scope="row">{row[0]}</TableCell>
                          <TableCell>
                          <Table className={classes.table}>
                            <TableHead>

                              <TableRow>
                                <TableCell width="390">MN</TableCell>
                                <TableCell>Votes</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {votedMNs.map(votedMN => {
                                var split = votedMN.split(":");
                                var votes = parseInt(split[1]);
                                return (
                                  <TableRow >
                                    <TableCell width="390">
                                      {split[0]}
                                    </TableCell>
                                    <TableCell>{votes}</TableCell>
                                    <TableCell>{ votes >= 6 ? "Enforced": (6 - votes) + " votes to enforce"}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                            </Table>
                          </TableCell>
                        </TableRow>
                      )
                    }
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


MasternodeWinners.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(MasternodeWinners);





