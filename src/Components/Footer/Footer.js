import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

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
    "height": "40px",
    "padding-top": "10px"
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

      
      Powered By Mcna

      <MyAddresses />
      <MyMasternodes />
    </div>
      
    );
  }

 
  
}

ChaincoinExplorerFooter.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChaincoinExplorerFooter);


