import React from 'react';
import { combineLatest } from 'rxjs';
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
import MyMasternodesGraph from './MyMasternodesGraph';

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

class MyMasternodes extends React.Component {
  state = {
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 10,
    loading: true,
    error: null
  };


  subscription = null;

  handleChangePage = (event, page) => {
    this.setState({ page });
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

  componentDidMount() {
    this.subscription = combineLatest(BlockchainServices.masternodeList, MyWalletServices.myMasternodes).subscribe(
      ([masternodeList, myMasternodes]) =>{

        myMasternodes.forEach(myMn =>{
          myMn.mn = masternodeList[myMn.output];
        });

        this.setState({
          rows: myMasternodes
        });
      });

  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleAddMasternode(){
    var name = prompt("Please enter a name for the masternode");
    if (name == null) return;

    var output = prompt("Please enter the masternode output");
    if (output == null) return;


    if (/^[a-fA-F0-9]{64}-[0-9]{1,8}$/.test(output) == false){
        alert("invalid masternode output");
        return;
    }


    MyWalletServices.addMyMasternode(name, output); //TODO: handle error
  }

  handleDeleteMasternode(output, MyWalletServices)
  {
    return ()=>{
      if (window.confirm("Are you sure?") == false) return;
      MyWalletServices.deleteMyMasternode(output); //TODO: handle error
    }
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
        <Button variant="contained" color="primary" className={classes.button} onClick={this.handleAddMasternode}>
          Add Masternode
        </Button>
        <Paper>
          <div className={classes.tableWrapper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Seen</TableCell>
                  <TableCell>Last Paid</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                  <TableRow >
                    <TableCell component="th" scope="row"><Link to={"/Explorer/MasternodeList/" + row.output}>{row.name}</Link></TableCell>
                    <TableCell>
                      {
                        row.mn != null ? 
                        row.mn.status :
                        "Not Found"
                      }
                    </TableCell>
                    <TableCell>
                      {
                        row.mn != null ? 
                        TimeToString(row.mn.lastseen) :
                        "Not Found"
                      }
                    </TableCell>
                    <TableCell>
                      {
                        row.mn != null ? 
                        TimeToString(row.mn.lastpaidtime) :
                        "Not Found"
                      }
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" color="secondary" className={classes.button} onClick={this.handleDeleteMasternode(row.output,MyWalletServices)}>
                        Remove
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


MyMasternodes.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(MyMasternodes);





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}

