import React from 'react';
import { combineLatest, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
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

import AddMyMasternodeDialog from '../../../../Components/Dialogs/MyMasternodeDialog';
import ImportMasternodeConfDialog from '../../../../Components/Dialogs/ImportMasternodeConfDialog';


import TablePaginationActions from '../../../../Components/TablePaginationActions';
import MasternodeMenu from '../../../../Components/MasternodeMenu';


import BlockchainServices from '../../../../Services/BlockchainServices';
import MyWalletServices from '../../../../Services/MyWalletServices';
import DialogService from '../../../../Services/DialogService';

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

    this.subscription = MyWalletServices.myMasternodes.pipe(
      switchMap(myMasternodes =>{
        if (myMasternodes.length == 0) return of([]);
        return combineLatest(myMasternodes.map(myMn => BlockchainServices.masternode(myMn.output).pipe(map(mn =>({myMn, mn})))))
      })
    ).subscribe(
      (rows) =>{
        this.setState({
          rows: rows
        });
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }



  labelDisplayedRows(){
    return "";
  }


  handleAddMasternode() {
    ;
  }

  handleAddMasternode() {
    DialogService.showDialog(AddMyMasternodeDialog);
  }
  ImportMasternodeConfDialog
 
  render() {
    const { classes } = this.props;
    const { rowsPerPage, page } = this.state;
    var { rows } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);



    return (
      <div>
        <Button variant="contained" color="primary" className={classes.button} onClick={() => DialogService.showDialog(AddMyMasternodeDialog)}>
          Add Masternode
        </Button>

        <Button variant="contained" color="primary" className={classes.button} onClick={() => DialogService.showDialog(ImportMasternodeConfDialog)}>
        Import Masternode.conf
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
                    <TableCell component="th" scope="row"><Link to={"/Explorer/MasternodeList/" + row.myMn.output}>{row.myMn.name}</Link></TableCell>
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
                      <MasternodeMenu output={row.myMn.output} payee={row.mn != null ? row.mn.payee : null} />
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

