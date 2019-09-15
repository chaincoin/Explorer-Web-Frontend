import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/lab/Slider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';

import TablePaginationActions from '../Components/TablePaginationActions';



import MinerService from '../Services/MinerService';

const styles = {
  root: {
    
  },
  slider: {
    padding: '22px 0px',
  },
  table: {
  },
  tableWrapper: {
    overflowX: 'scroll',
    "-webkit-overflow-scrolling": "touch"
  },
};

class Miner extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mining: false,
      strength:10,
      threads:1,
      hashRate: 0,
      
      rows:[],
      page: 0,
      rowsPerPage: 5,
    }

  }

  componentDidMount() {
    this.miningSubscriptions = MinerService.mining.subscribe(mining =>{
      this.setState({
        mining: mining
      });
    });

    this.strengthSubscriptions = MinerService.strength.subscribe(strength =>{
      this.setState({
        strength: strength
      });
    });
  
    this.threadsSubscriptions = MinerService.threads.subscribe(threads =>{
      this.setState({
        threads: threads
      });
    });

    this.hashRateSubscriptions = MinerService.hashRate.subscribe(hashRate =>{
      this.setState({
        hashRate: hashRate
      });
    });


    this.minedBlocksSubscriptions = MinerService.minedBlocks.subscribe(minedBlocks =>{
      this.setState({
        rows: minedBlocks
      });
    });
  }

  componentWillUnmount() {
    this.miningSubscriptions.unsubscribe();
    this.strengthSubscriptions.unsubscribe();
    this.threadsSubscriptions.unsubscribe();
    this.hashRateSubscriptions.unsubscribe();
    this.minedBlocksSubscriptions.unsubscribe();
  }

  handleStrengthChange = (event, strength) => {
    MinerService.setStrength(strength);
  };

  handleThreadsChange = (event, threads) => {
    MinerService.setThreads(threads);
  };

  handleStartClick = (event) => {
    MinerService.start();
  };

  handleStopClick = (event) => {
    MinerService.stop();
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: event.target.value });
  };

  labelDisplayedRows(){
    return "";
  }

  

  render(){
    const { classes } = this.props;
    const { mining, strength, threads, hashRate, rows, page, rowsPerPage } = this.state

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
    <div className={classes.root}>
      <Card>
        <CardHeader>
        CHC Miner
        </CardHeader>
        <CardBody>
          <CardText>
          Hash rate: {mining == true? hashRate : "Stopped"} <br/>
          <div>
            Mining Strength
            <Slider
              classes={{ container: classes.slider }}
              value={strength}
              aria-labelledby="label"
              onChange={this.handleStrengthChange} 
              step={1}
              max={100}/>
          </div>

          <div>
            Mining Threads
            <Slider
              classes={{ container: classes.slider }}
              value={threads}
              aria-labelledby="label"
              onChange={this.handleThreadsChange} 
              step={1}
              max={24}/>
          </div>

          <Button variant="contained" color="primary" className={classes.button} onClick={this.handleStartClick}>
            Start
          </Button>
          <Button variant="contained" color="secondary" className={classes.button} onClick={this.handleStopClick}>
            Stop
          </Button>

          </CardText>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
        Mined Blocks 
        </CardHeader>
        <CardBody>
        <Paper className={classes.root}>
            <div className={classes.tableWrapper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Block</TableCell>
                    <TableCell>Hash</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                    <TableRow key={row.height}>
                      <TableCell>{row.height}</TableCell>
                      <TableCell>{row.hash}</TableCell>
                    </TableRow>
                  ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 48 * emptyRows }}>
                      <TableCell colSpan={3} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              labelRowsPerPage=""
              rowsPerPageOptions={[]}
              labelDisplayedRows={this.labelDisplayedRows}
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
          </Paper>
        </CardBody>
      </Card>

      
    </div>
      
    );
  }

  
}

Miner.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Miner);