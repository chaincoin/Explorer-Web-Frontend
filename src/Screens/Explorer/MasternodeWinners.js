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
    overflowX: 'auto',
  },
});

class MasternodeWinners extends React.Component {
  state = {
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 10,
    loading: true,
    windowWidth: 0,
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

    window.addEventListener("resize", this.updateDimensions);
    this.setState({windowWidth: window.innerWidth});

    this.masternodeWinnersSubscription = BlockchainServices.masternodeWinners.subscribe((masternodeWinners) =>{
      this.setState({
        rows: Object.entries(masternodeWinners)
      });
    });

  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions); 
    this.masternodeWinnersSubscription.unsubscribe();
  }


  updateDimensions = () => {
    this.setState({windowWidth: window.innerWidth});
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
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Block</TableCell>
                  <TableCell>Votes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                  <TableRow >
                    <TableCell component="th" scope="row">{row[0]}</TableCell>
                    <TableCell>{row[1]}</TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 48 * emptyRows }}>
                    <TableCell colSpan={2} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
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
                </TableRow>
              </TableFooter>
            </Table>
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





