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

import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";

import TablePaginationActions from '../../Components/TablePaginationActions';

import BlockDetailsTransactions from './BlockDetails/BlockDetailsTransactions';

import BlockchainServices from '../../Services/BlockchainServices';


let counter = 0;
function createData(name, calories, fat) {
  counter += 1;
  return { id: counter, name, calories, fat };
}

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {

  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class BlockList extends React.Component {
  state = {
    rows: [],
    rowsExpanded:[],
    page: 0,
    rowsPerPage: 10,
    loading: true,

    blockCount: null
  };

  blockCountSubscription = null;

  handleChangePage = (event, page) => {
    this.setState({ 
      page,
      rowsExpanded:[]
    }, 
    this.getBlocks);
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ 
      page: 0, 
      rowsPerPage: parseInt(event.target.value),
    }, 
      this.getBlocks
    );
  };

  componentDidMount() {


    this.blockCountSubscription = BlockchainServices.blockCount.subscribe((blockCount) =>{
      //TODO: this works to make the Pagination controls correct but its not great and the Displayed Item numbers is wrong 
      var page = this.state.page;
      if (this.state.rows[0] != null && this.state.blockCount != blockCount)
      {
        var height = this.state.rows[0].height;
        page = Math.ceil((blockCount - height) / this.state.rowsPerPage);
      }

      this.setState({
        blockCount,
        page
      }, this.state.blockCount == null ? this.getBlocks : null);
    });

  }

  componentWillUnmount() {
    this.blockCountSubscription.unsubscribe();
  }





  getBlocks(){
    var blockPos = this.state.blockCount - (this.state.page * this.state.rowsPerPage);
    var rowsPerPage = blockPos < this.state.rowsPerPage ? blockPos : this.state.rowsPerPage;

    BlockchainServices.getBlocks(blockPos,rowsPerPage)
      .then(
        (results) => {
          this.setState({
            loading: false,
            rows: results
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            loading: false,
            error
          });
        }
      )
  }

  labelDisplayedRows(){
    return "";
  }


  rowToHtml = (row, i) =>
  {
    const expanded = this.state.rowsExpanded[i] == true;
    const elements = [];


    const handleExpandMore = () =>{
      var rowsExpanded = this.state.rowsExpanded.splice();
      rowsExpanded[i] = true;

      this.setState({
        rowsExpanded
      });
    }

    const handleExpandLess = () =>{
      var rowsExpanded = this.state.rowsExpanded.splice();
      rowsExpanded[i] = false;

      this.setState({
        rowsExpanded
      });
    }

    elements.push((
      <TableRow key={row.id}>
        <TableCell component="th" scope="row"><Link to={"/Explorer/Block/" + row.height}>{row.height}</Link></TableCell>
        <TableCell><Link to={"/Explorer/Block/" + row.height}>{row.hash}</Link></TableCell>
        <TableCell>{row.tx.map(tx => tx.recipients).reduce(add)}</TableCell>
        <TableCell>{row.tx.map(tx => tx.value).reduce(add)}</TableCell>
        <TableCell>{TimeToString(row.time)}</TableCell>
        <TableCell>
        {
          expanded == false ? 
          <ExpandMore onClick={handleExpandMore}/>:
          <ExpandLess onClick={handleExpandLess}/>
        }
        </TableCell>
      </TableRow>
    ));

    if (expanded){
      elements.push((
        <TableRow>
          <TableCell colSpan={6}>

            <BlockDetailsTransactions block={row} />

          </TableCell>
        </TableRow>
      ));
    }
    

    return elements;
  }
 
  render() {
    const { classes } = this.props;
    const { rows, rowsPerPage, page, blockCount } = this.state;
    const emptyRows = rowsPerPage - rows.length;

    return (
      <Card className={classes.root}>
        <CardHeader>
          Blocks
        </CardHeader>
        <CardBody>
          <Paper>
            <div className={classes.tableWrapper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Block</TableCell>
                    <TableCell>Hash</TableCell>
                    <TableCell>Recipients</TableCell>
                    <TableCell>Amount (CHC)</TableCell>
                    <TableCell>Timestamp</TableCell>

                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row =>(
                    <TableRow key={row.id}>
                    <TableCell component="th" scope="row"><Link to={"/Explorer/Block/" + row.height}>{row.height}</Link></TableCell>
                    <TableCell><Link to={"/Explorer/Block/" + row.height}>{row.hash}</Link></TableCell>
                    <TableCell>{row.tx.map(tx => tx.recipients).reduce(add)}</TableCell>
                    <TableCell>{row.tx.map(tx => tx.value).reduce(add)}</TableCell>
                    <TableCell>{TimeToString(row.time)}</TableCell>
                  </TableRow>
                  ))}

                  {emptyRows > 0 && (
                    <TableRow style={{ height: 48 * emptyRows }}>
                      <TableCell colSpan={5} />
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
              count={blockCount}
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







BlockList.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(BlockList);





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}


function add(accumulator, a) {

  if (accumulator == null || a == null) return null
  return accumulator + a;
}