import React from 'react';
import { combineLatest } from 'rxjs';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Graph from '../../../../Components/PayOutGraph';
import Paper from '@material-ui/core/Paper';

import BlockchainServices from '../../../../Services/BlockchainServices';
import MyWalletServices from '../../../../Services/MyWalletServices';

const styles = {
  root: {
    
  },
  paper:{
    padding:"10px"
  }
};

class MyAddressesGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      myAddresses:null
    };
  
    this.subscription = null;
  }

  

  componentDidMount() {
    this.subscription = MyWalletServices.myAddresses.subscribe(
      (myAddresses) =>{

        this.setState({
          myAddresses: myAddresses
        });
      });

  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render(){
    const { classes, payOutType } = this.props;
    var { myAddresses } = this.state;

    var addresses = [];
    var names = [];
    if (myAddresses != null)
    {
      myAddresses.forEach(myAddress => {
        names.push(myAddress.name);
        addresses.push(myAddress.address);
      });
    }
    


    return (
      <Paper className={classes.paper}>
      {
        myAddresses != null ? 
        <Graph names={names} addresses={addresses} payOutType={payOutType} /> :
        ""
      }
      </Paper>
      
    );
  }

  
}



MyAddressesGraph.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAddressesGraph);



