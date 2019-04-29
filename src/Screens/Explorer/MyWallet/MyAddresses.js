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
import Button from '@material-ui/core/Button';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";

import TablePaginationActions from '../../../Components/TablePaginationActions';

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
    overflowX: 'auto',
  },
});

class MyAddresses extends React.Component {
  

  state = {
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 10,
    loading: true,
    windowWidth: 0,
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

    window.addEventListener("resize", this.updateDimensions);
    this.setState({windowWidth: window.innerWidth});


    this.myAddressesSubscription = MyWalletServices.myAddresses.subscribe(myAddresses =>{ //TODO: this could be done better

        this.addressSubscriptions.forEach(v => v.unsubscribe());
        this.setState({
          rows: myAddresses 
        }, () =>{

          this.addressSubscriptions = myAddresses.map((address, index) => {
            return BlockchainServices.getAddress(address.address).subscribe(address =>{
              this.setState({
                rows: update(this.state.rows, {[index]: {data: {$set: address}}})
              })
  
            });
          });

        });
      });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions); 
    this.myAddressesSubscription.unsubscribe();
    this.addressSubscriptions.forEach(v => v.unsubscribe());

  }


  updateDimensions = () => {
    this.setState({windowWidth: window.innerWidth});
  }

  

  handleCreateAddress(){
    var name = prompt("Please enter a name for the address");
    if (name == null) return;

    var keyPair = bitcoin.ECPair.makeRandom({ network: Chaincoin }); // eslint-disable-line no-undef
    var WIF = keyPair.toWIF();
    //var address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: Chaincoin }).address;
                
    var address = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: Chaincoin }).address; // eslint-disable-line no-undef

    MyWalletServices.addMyAddress(name, address, WIF); //TODO: handle error
  }

  handleImportAddress(){
    var WIF = prompt("Please enter WIF");
    if (WIF == null || WIF == "") return;

    var name = prompt("Please enter a name for the address");
    if (name == null) return;

    var keyPair = bitcoin.ECPair.fromWIF(WIF, Chaincoin); // eslint-disable-line no-undef
    var address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: Chaincoin }).address; // eslint-disable-line no-undef

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

  handleDeleteAddress(address)
  {
    return function(){
      if (window.confirm("Are you sure? the address cant be recovered") == false) return;
      MyWalletServices.deleteMyAddress(address); //TODO: handle error
    }
  }


  handleExportWif(WIF)
  {
    return function(){
      alert(WIF);
    }
  }
 
  render() {
    const { classes } = this.props;
    const { rowsPerPage, page } = this.state;
    var { rows } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);



    return (
      <Card>
        <CardHeader>
          My Addresses
        </CardHeader>
        <CardBody>

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
                      <Button variant="contained" color="secondary" className={classes.button} onClick={this.handleDeleteAddress(row.address)}>
                        Remove
                      </Button>
                      <Button variant="contained" color="primary" className={classes.button} onClick={this.handleExportWif(row.WIF)} disabled={row.WIF == null}>
                        WIF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 48 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
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
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>
        </CardBody>
      </Card>
      
    );
  }
}


MyAddresses.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(MyAddresses);





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}

var Chaincoin = {
  messagePrefix: 'DarkCoin Signed Message:\n',
  bip32: {
  public: 0x02FE52F8,
  private: 0x02FE52CC
  },
  bech32: "chc",
  pubKeyHash: 0x1C,
  scriptHash: 0x04,
  wif: 0x9C
};