import React from 'react';
import { combineLatest } from 'rxjs';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, CardBody, CardHeader } from 'reactstrap';
import Graph from '../../../Components/PayOutGraph';
import Paper from '@material-ui/core/Paper';

import BlockchainServices from '../../../Services/BlockchainServices';
import MyWalletServices from '../../../Services/MyWalletServices';
import { switchMap, first, map } from 'rxjs/operators';

const styles = {
  root: {
    
  },
  paper:{
    padding:"10px"
  }
};

class MyMasternodesGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      myMasternodes:null
    };
  
    this.subscription = null;
  }

  

  componentDidMount() {
    this.subscription = MyWalletServices.myMasternodes.pipe(
      switchMap(myMasternodes => combineLatest(myMasternodes.map(myMn => BlockchainServices.masternode(myMn.output).pipe(first(),map(mn => {
        return {
          myMn: myMn,
          mn:mn
        }
      })))))
    ).subscribe(
      (myMasternodes) =>{
        this.setState({
          myMasternodes: myMasternodes
        });
    });
    


  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render(){
    const { classes } = this.props;
    var { myMasternodes } = this.state;

    var addresses = [];
    var names = [];
    if (myMasternodes != null)
    {
      myMasternodes.forEach(myMn => {
        if (myMn.mn != null) {
          names.push(myMn.myMn.name);
          addresses.push(myMn.mn.payee);
        }
      });
    }
    


    return (
      <Paper className={classes.paper}>
      {
        myMasternodes != null ? 
        <Graph names={names} addresses={addresses} payOutType="masternode" /> :
        ""
      }
      </Paper>
      
    );
  }

  
}



MyMasternodesGraph.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MyMasternodesGraph);



