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

import TablePaginationActions from '../../Components/TablePaginationActions';


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

class BlockList extends React.Component {
  state = {
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 5,
    loading: true,
    windowWidth: 0
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: event.target.value });
  };

  componentDidMount() {

    window.addEventListener("resize", () => this.updateDimensions());
    this.setState({windowWidth: window.innerWidth});

    fetch(`https://api.chaincoinexplorer.co.uk/getBlocks?blockId=1811550&pageSize=${this.state.rowsPerPage}&extended=true`)
      .then(res => res.json())
      .then(
        (results) => {
          this.setState({
            loading: true,
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

  componentWillUnmount() {
    window.removeEventListener("resize", () => this.updateDimensions()); //TODO: this wont work as expected 
  }


  updateDimensions() {
    this.setState({windowWidth: window.innerWidth});
  }
 
  render() {
    const { classes } = this.props;
    const { rows, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
      <Card>
        <CardHeader>
          Blocks
        </CardHeader>
        <CardBody>
          <Paper>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Block</TableCell>
                  <TableCell hidden={this.state.windowWidth < 1110}>Hash</TableCell>
                  <TableCell hidden={this.state.windowWidth < 660}>Recipients</TableCell>
                  <TableCell hidden={this.state.windowWidth < 560}>Amount (CHC)</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">{row.height}</TableCell>
                    <TableCell hidden={this.state.windowWidth < 1110}>{row.hash}</TableCell>
                    <TableCell hidden={this.state.windowWidth < 660}>{row.tx.map(tx => tx.recipients).reduce(add)}</TableCell>
                    <TableCell hidden={this.state.windowWidth < 560}>{row.tx.map(tx => tx.value).reduce(add)}</TableCell>
                    <TableCell>{TimeToString(row.time)}</TableCell>
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
                    colSpan={3}
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


BlockList.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(BlockList);





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}


function add(accumulator, a) {
  return accumulator + a;
}