import React from 'react';
import update from 'react-addons-update'; // ES6
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

import TablePaginationActions from '../Components/TablePaginationActions';


import BlockchainServices from '../Services/BlockchainServices';

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

class BountyList extends React.Component {
  state = {
    rows: [
      {
        name: "Whitepaper",
        created: 1539358186,
        address: "CV55x9mMa8tFDkTD3ykzn569G99znMqSHX",
        notes:"For more information either join Chaincoin discord https://discord.gg/VTjrPr2 or email me at mcna@chaincoin.org",
        value: null
      }
    ],
    page: 0,
    rowsPerPage: 10,
    loading: true,
    windowWidth: 0,
    error: null
  };

  addressSubscriptions = [];

  handleChangePage = (event, page) => {
    this.setState({ page });
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

  componentDidMount() {

    window.addEventListener("resize", this.updateDimensions);
    this.setState({windowWidth: window.innerWidth});

    this.addressSubscriptions = this.state.rows.map((row, index) => BlockchainServices.getAddress(row.address).subscribe(address =>{

      this.setState({
        rows: update(this.state.rows, {[index]: {value: {$set: address.balance}}})
      })

    }));
    

  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);

    this.addressSubscriptions.forEach(addressSubscription => {
      addressSubscription.unsubscribe();
    });
  }


  updateDimensions = () => {
    this.setState({windowWidth: window.innerWidth});
  }


  
 
  render() {
    const { classes } = this.props;
    const { rows, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return ( 
      <Card>
        <CardHeader>
          CHC Bounties
        </CardHeader>
        <CardBody>
          <Paper>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Amount (CHC)</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                  <TableRow >
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{TimeToString(row.created)}</TableCell>
                    <TableCell>{row.value}</TableCell>
                    <TableCell>{row.notes}</TableCell>
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


BountyList.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(BountyList);






var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}