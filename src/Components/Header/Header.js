import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Network from './Network';
import BlockCount from './BlockCount';
import Masternodes from './Masternodes';
import CoinSupply from './CoinSupply';

import liveLogo from '../../images/main-logo-Live.png';
import stagingLogo from '../../images/main-logo-Staging.png';
import testLogo from '../../images/main-logo-Test.png';


import Environment from '../../Services/Environment';

const styles = {
  root: {
    "width": "90%",
    "padding-top": "10px",
    "padding-bottom": "10px",
    "display": "table",
    "margin": "0 auto"
  },

  mainLogo:{
    width: "10em",
    display: "table",
    margin: "0 auto"
  }
};

class ChaincoinExplorerHeader extends React.Component {
  constructor(props) {
    super(props);

  
  }



  render(){
    const { classes } = this.props;
    return (
    <div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={12} sm={6} lg={2}>
          <Network />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
         <BlockCount />
        </Grid>

        <Grid item xs={12} sm={12} lg={4}>

        </Grid>

        <Grid item xs={12} sm={6} lg={2}>
          <CoinSupply />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <Masternodes />
        </Grid>
        
      </Grid>
    </div>
      
    );
  }

 
  
}

ChaincoinExplorerHeader.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChaincoinExplorerHeader);


var getLogo = () =>{
  if (Environment.environment == "Staging") return stagingLogo;
  if (Environment.environment == "Test") return testLogo;
  return liveLogo;
}