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
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";

import TablePaginationActions from '../../Components/TablePaginationActions';

import MasternodeMenu from '../../Components/MasternodeMenu'

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
    overflowX: 'auto',
  },
});

class MasternodeList extends React.Component {
  state = {
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 10,
    loading: true,
    windowWidth: 0,
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

  handleMenuClick = (rowPos) => {
    return (event) =>{
      var menuAnchorEls = [];
      menuAnchorEls[rowPos] = event.currentTarget;
      this.setState({ menuAnchorEl: menuAnchorEls });
    }
  };

  handleMenuClose = () => {
    this.setState({ menuAnchorEl: [] });
  };

  
  handleMenuAddToMyMNs = (output) => {
    return () =>{
      this.handleMenuClose();
      var name = prompt("Please enter a name for the masternode");
      if (name == null) return;

      MyWalletServices.addMyMasternode(name, output); //TODO: handle error
    }
  };

  handleMenuRemoveFromMyMns = (output) => {
    return () =>{
      this.handleMenuClose();

      if (window.confirm("Are you sure?") == false) return;
      MyWalletServices.deleteMyMasternode(output); //TODO: handle error
      
    }
  };

  componentDidMount() {

    window.addEventListener("resize", this.updateDimensions);
    this.setState({windowWidth: window.innerWidth});

    this.masternodeListSubscription = BlockchainServices.masternodeList.subscribe((masternodeList) =>{
      this.setState({
        rows: Object.entries(masternodeList)
      });
    });

  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.updateDimensions); 
    this.masternodeListSubscription.unsubscribe();
  }


  updateDimensions = () => {
    this.setState({windowWidth: window.innerWidth});
  }


  handleSearch = (event) => {
    this.setState({ searchInput: event.target.value });
  }
 
  render() {
    const { classes } = this.props;
    const { rowsPerPage, page, menuAnchorEl } = this.state;
    var { rows, searchInput } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);



    if (searchInput != "")
    {
      searchInput = searchInput.toLowerCase();
      rows = rows.slice(0).filter(row => {
        return row[0].toLowerCase().indexOf(searchInput) > -1 || 
        row[1].payee.toLowerCase().indexOf(searchInput) > -1 ||
        row[1].address.toLowerCase().indexOf(searchInput) > -1 ||
        row[1].status.toLowerCase().indexOf(searchInput) > -1;
      });
    }
    

    return (
      <Card>
        <CardHeader>
          Masternodes
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
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Address</TableCell>
                  <TableCell>Payee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Seen</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowPos) => (
                  <TableRow >
                    <TableCell component="th" scope="row"><Link to={"/Explorer/MasternodeList/" + row[0]}>{row[1].address}</Link></TableCell>
                    <TableCell><Link to={"/Explorer/Address/" + row[1].payee}>{row[1].payee}</Link></TableCell>
                    <TableCell>{row[1].status}</TableCell>
                    <TableCell>{TimeToString(row[1].lastseen)}</TableCell>
                    <TableCell>
                      <MasternodeMenu output={row[0]} payee={row[1].payee} />
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 48 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={7}
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


MasternodeList.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(MasternodeList);





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}

