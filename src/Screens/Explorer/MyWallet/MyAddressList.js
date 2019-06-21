import React from 'react';
import update from 'react-addons-update'; // ES6
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

import TablePaginationActions from '../../../Components/TablePaginationActions';
import AddressMenu from '../../../Components/AddressMenu'

import BlockchainServices from '../../../Services/BlockchainServices';
import MyWalletServices from '../../../Services/MyWalletServices';



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

  };


  myAddressesSubscription = null;
  addressSubscriptions = [];

  handleChangePage = (event, page) => {
    this.setState({ page });
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

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
  }

  componentWillUnmount() {
    this.myAddressesSubscription.unsubscribe();
    this.addressSubscriptions.forEach(v => v.unsubscribe());

  }


  handleCreateAddress(){
    var name = prompt("Please enter a name for the address");
    if (name == null) return;

    var keyPair = bitcoin.ECPair.makeRandom({ network: BlockchainServices.Chaincoin }); // eslint-disable-line no-undef
    var WIF = keyPair.toWIF();
    //var address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: Chaincoin }).address;
                
    var address = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }).address; // eslint-disable-line no-undef

    MyWalletServices.addMyAddress(name, address, WIF); //TODO: handle error
  }

  handleImportAddress(){
    var WIF = prompt("Please enter WIF");
    if (WIF == null || WIF == "") return;

    var name = prompt("Please enter a name for the address");
    if (name == null) return;

    var keyPair = bitcoin.ECPair.fromWIF(WIF, BlockchainServices.Chaincoin); // eslint-disable-line no-undef
    var address = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }).address; // eslint-disable-line no-undef

    MyWalletServices.addMyAddress(name,address, WIF);
  }

  handleWatchAddress(){
    var name = prompt("Please enter a name for the address");
    if (name == null) return;

    var address = prompt("Please enter the address");
    if (address == null) return;

    BlockchainServices.validateAddress(address).then(function(response){
      if (response.isvalid){
          MyWalletServices.addMyAddress(name,address);
      }
      else{
          alert("invalid address");
      }
        
    });
  }



  labelDisplayedRows(){
    return "";
  }
 
  render() {
    const { classes } = this.props;
    const { rowsPerPage, page } = this.state;
    var { rows } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
      <div>
        <Button variant="contained" color="primary" className={classes.button} onClick={this.handleCreateAddress}>
          Create Address
        </Button>

        <Button variant="contained" color="primary" className={classes.button} onClick={this.handleWatchAddress}>
          Watch Address
        </Button>

        <Button variant="contained" color="primary" className={classes.button} onClick={this.handleImportAddress}>
          Import Address
        </Button>
        
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





