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
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class RichList extends React.Component {
  state = {
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 10,
    loading: true,
    error: null,
    windowWidth: 0,

    richListCount: null
  };

  richListCountSubscription = null;

  handleChangePage = (event, page) => {
    this.setState({ page }, this.getRichList);
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) }, this.getRichList);
  };

  componentDidMount() {

    window.addEventListener("resize", this.updateDimensions);
    this.setState({windowWidth: window.innerWidth});

    this.richListCountSubscription = BlockchainServices.richListCount.subscribe((richListCount) =>{

      this.setState({
        richListCount: richListCount
      }, this.state.richListCount == null ? this.getRichList : null);
    });

  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions); //TODO: this wont work as expected 
    this.richListCountSubscription.unsubscribe();
  }


  updateDimensions = () => {
    this.setState({windowWidth: window.innerWidth});
  }


  getRichList(){
    var pos = this.state.page * this.state.rowsPerPage;
    var rowsPerPage = this.state.rowsPerPage;

    fetch(`https://api.chaincoinexplorer.co.uk/getRichList?pos=${pos}&pageSize=${rowsPerPage}&extended=true`)
      .then(res => res.json())
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
 
  render() {
    const { classes } = this.props;
    const { rows, rowsPerPage, page, richListCount } = this.state;
    const emptyRows = rowsPerPage - rows.length;

    return (
      <Card>
        <CardHeader>
          Rich List
        </CardHeader>
        <CardBody>
          <Paper>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Address</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Balance (CHC)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row"><Link to={"/Explorer/Address/" + row.address}>{row.address}</Link></TableCell>
                    <TableCell>{TimeToString(row.lastActivity)}</TableCell>
                    <TableCell>{row.balance}</TableCell>
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
                    count={richListCount}
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


RichList.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(RichList);



var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}