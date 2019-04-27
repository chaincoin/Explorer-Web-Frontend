import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
      flexGrow: 1,
      overflow: 'hidden',
      padding: `0 ${theme.spacing.unit * 3}px`,
    }
});


class HomeScreen extends React.Component {


    render() {

        return "Home"
      
    }

  }


  
  export default withStyles(styles)(HomeScreen);