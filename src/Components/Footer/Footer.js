import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';

import MyAddresses from './MyAddresses'
import MyMasternodes from './MyMasternodes'


const styles = {
  root: {
    "position": "fixed",
    "left": "0",
    "bottom": "0",
    "width": "100%",
    "background-color": "rgb(51, 51, 51)",
    "color": "white",
    "padding-top": "10px"
  },
  poweredBy:{
    "text-align":"center"
  },
  controls:{
    "float":"right"
  }
};

class ChaincoinExplorerFooter extends React.Component {
  constructor(props) {
    super(props);

  
  }



  render(){
    const { classes } = this.props;
    return (
    <div className={classes.root}>

      <Grid container spacing={24}>
        <Hidden xsDown>
          <Grid item xs={0} sm={4} lg={4}>

          </Grid>
        </Hidden>
        <Grid item xs={12} sm={4} lg={4}>
          <div className={classes.poweredBy}>
            Powered By Mcna
          </div>
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <span className={classes.controls}>
            <MyAddresses />
            <MyMasternodes />
          </span>
        </Grid>
      </Grid>

      
      

      
      
    </div>
      
    );
  }

 
  
}

ChaincoinExplorerFooter.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChaincoinExplorerFooter);


