import React from 'react';

import { combineLatest } from 'rxjs';

import bigDecimal from 'js-big-decimal';


import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Switch from '@material-ui/core/Switch';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Checkbox from '@material-ui/core/Checkbox';


import TablePaginationActions from '../../../../Components/TablePaginationActions';
import CoinControlMenu from '../../../../Components/CoinControlMenu';



const styles = {
  tableWrapper: {
    overflowX: 'scroll',
    "-webkit-overflow-scrolling": "touch"
  },
  expansionPanelDetails:{
    "display": "block"
  }
};

class AddressCoinControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedInputs: [],

      page: 0,
      rowsPerPage: 10
    };
  
    this.subscription = null;
  }


  componentDidMount() {
    this.subscription = this.props.transaction.selectedInputs.subscribe(selectedInputs => this.setState({selectedInputs}));
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }


  handleInputChange = (input) =>{
    return (event) =>{


      if (event.target.checked == true) this.props.transaction.addSelectedInput(input.unspent.txid, input.unspent.vout);
      else this.props.transaction.removeSelectedInput(input.unspent.txid, input.unspent.vout);
    }
  };


  handleInputAddressChange = (event) =>{

    if (event.target.checked == true)this.props.inputAddress.inputs.forEach(input => this.props.transaction.addSelectedInput(input.unspent.txid, input.unspent.vout)); //TODO: maybe have an add many option
    else this.props.inputAddress.inputs.forEach(input => this.props.transaction.removeSelectedInput(input.unspent.txid, input.unspent.vout)); //TODO: maybe have a remove many option
  };


  handleChangePage = (event, page) => {
    this.setState({ page });
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

  labelDisplayedRows(){
    return "";
  }

  render = () =>
  {
    const { classes, inputAddress, transaction } = this.props;
    const { selectedInputs, page, rowsPerPage } = this.state;

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, inputAddress.inputs.length - page * rowsPerPage);


    var allSelected = inputAddress.inputs.find(input => selectedInputs.indexOf(input) == -1) == null;

    


    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Checkbox
            checked={allSelected}
            onClick={(e)=> e.stopPropagation()}
            onChange={this.handleInputAddressChange}
            color="primary"
            disabled={inputAddress.inputs.length == 0}
          />
        {inputAddress.myAddress.name} {inputAddress.address.balance}
        
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.expansionPanelDetails}>
          <div className={classes.tableWrapper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Confirmations</TableCell>
                  <TableCell>Locked Reason</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inputAddress.inputs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(input => (
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        checked={selectedInputs.indexOf(input) != -1}
                        onChange={this.handleInputChange(input)}
                        disabled={(input.disabled)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{input.unspent.value}</TableCell>
                    <TableCell>{TimeToString(input.unspent.time)}</TableCell>
                    <TableCell>{input.confirmations}</TableCell>
                    <TableCell>
                      { input.inMemPool ? "In MemPool, " : null }
                      { input.inMnList ? "In MN List, " : null } 
                      { input.isMatureCoins == false ? "Not Mature, " : null } 
                      { input.lockState != null ? (input.lockState == true ? "User Locked," : "User Unlocked,") : null }
                    </TableCell>
                    <TableCell>
                      <CoinControlMenu input={input}/>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            labelRowsPerPage=""
            rowsPerPageOptions={[]}
            colSpan={5}
            labelDisplayedRows={this.labelDisplayedRows}
            count={inputAddress.inputs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            SelectProps={{
              native: true,
            }}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
          />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }

}



AddressCoinControl.propTypes = {
  classes: PropTypes.object.isRequired,
  transaction: PropTypes.object.isRequired,
  inputAddress: PropTypes.object.isRequired
};

export default withStyles(styles)(AddressCoinControl);



var TimeToString = (timestamp) =>{ //TODO: make this an include
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}
