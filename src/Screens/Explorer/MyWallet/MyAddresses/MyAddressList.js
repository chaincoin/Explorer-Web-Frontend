
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
import Button from '@material-ui/core/Button';

import { Link } from "react-router-dom";





import TablePaginationActions from '../../../../Components/TablePaginationActions';
import AddressMenu from '../../../../Components/AddressMenu'

import CreateAddressDialog from '../../../../Components/Dialogs/CreateMyAddressDialog';
import WatchAddressDialog from '../../../../Components/Dialogs/WatchAddressDialog'
import ImportWifDialog from '../../../../Components/Dialogs/ImportWifDialog';

import SetWalletPasswordDialog from '../../../../Components/Dialogs/SetWalletPasswordDialog';

import BlockchainServices from '../../../../Services/BlockchainServices';
import MyWalletServices from '../../../../Services/MyWalletServices';
import DialogService from '../../../../Services/DialogService';

import RemoveWalletPassword from '../../../../Observables/RemoveWalletPasswordObservable';


const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  button: {
    margin: theme.spacing.unit,
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'scroll',
    "-webkit-overflow-scrolling": "touch"
  },
});

class MyAddresses extends React.Component {
  

  state = {
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 10,
    loading: true,
    error: null,

    walletEncrypted:false
  };


  myAddressesSubscription = null;
  addressSubscriptions = [];

  handleChangePage = (event, page) => {
    this.setState({ page });
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

  handleRemoveWalletPassword = () =>{
    RemoveWalletPassword.subscribe();
  }

  componentDidMount() {
    this.myAddressesSubscription = MyWalletServices.myAddresses.subscribe(myAddresses =>{ //TODO: this could be done better

      this.addressSubscriptions.forEach(v => v.unsubscribe());
      this.setState({
        rows: myAddresses 
      }, () =>{

        this.addressSubscriptions = myAddresses.map((myAddress, index) => {
          return BlockchainServices.getAddress(myAddress.address).subscribe(address =>{
            myAddress.data = address;
            this.setState({
              rows: myAddresses.slice()
            })
          });
        });

      });
    });

    this.isWalletEncryptedSubscription = MyWalletServices.isWalletEncrypted.subscribe((walletEncrypted) =>this.setState({walletEncrypted}))
  }

  componentWillUnmount() {
    this.myAddressesSubscription.unsubscribe();
    this.addressSubscriptions.forEach(v => v.unsubscribe());

    this.isWalletEncryptedSubscription.unsubscribe();

  }


  labelDisplayedRows(){
    return "";
  }
 
  render() {
    const { classes } = this.props;
    const { rowsPerPage, page, walletEncrypted } = this.state;
    var { rows } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
      <div>
        <Button variant="contained" color="primary" className={classes.button} onClick={() => DialogService.showDialog(CreateAddressDialog).subscribe()}>
          Create Address
        </Button>


        
        <Button variant="contained" color="primary" className={classes.button} onClick={() => DialogService.showDialog(WatchAddressDialog).subscribe()}>
          Watch Address
        </Button>
        <Button variant="contained" color="primary" className={classes.button} onClick={() => DialogService.showDialog(ImportWifDialog).subscribe()}>
          Import WIF
        </Button>

        {
          walletEncrypted ? 
          <Button variant="contained" color="primary" className={classes.button} onClick={this.handleRemoveWalletPassword}>
            Remove Wallet Password
          </Button> :
          <Button variant="contained" color="primary" className={classes.button} onClick={() => DialogService.showDialog(SetWalletPasswordDialog).subscribe()}>
            Set Wallet Password
          </Button> 
        }
        
        
          <Paper>
            <div className={classes.tableWrapper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Balance (CHC)</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                    <TableRow >
                      <TableCell>
                        {row.name}
                      </TableCell>
                      <TableCell component="th" scope="row"><Link to={"/Explorer/Address/" + row.address}>{row.address}</Link></TableCell>
                      <TableCell>
                        {
                          row.data != null ? 
                          row.data.balance :
                          "0"
                        }
                      </TableCell>
                      <TableCell>
                        <AddressMenu address={row.address} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 48 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              labelRowsPerPage=""
              rowsPerPageOptions={[]}
              labelDisplayedRows={this.labelDisplayedRows}
              colSpan={5}
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
      </div>
    );
  }
}


MyAddresses.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(MyAddresses);





