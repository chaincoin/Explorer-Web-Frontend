import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { combineLatest } from 'rxjs';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import SendIcon from '@material-ui/icons/Send';

import BlockchainServices from '../../Services/BlockchainServices';
import MyWalletServices from '../../Services/MyWalletServices';

const styles = theme => ({
  root: {
   display:"inline"
  },
  menuItem: {
    
  },
  primary: {},
  icon: {},
});

class MyMasternodes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,

      myMasternodes: null,
      mnProblems: 0
    };

    this.subscription = null;
  }


  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };



  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  componentDidMount() {
    this.subscription = combineLatest(BlockchainServices.masternodeList, MyWalletServices.myMasternodes).subscribe(
      ([masternodeList, myMasternodes]) =>{

        var mnProblems = false;

        myMasternodes.forEach(myMn =>{
          myMn.mn = masternodeList[myMn.output];

          if (myMn.mn == null || myMn.mn.status != "ENABLED") mnProblems = mnProblems + 1;
        });

        this.setState({
          myMasternodes: myMasternodes,
          mnProblems: mnProblems
        });
      });
  }

  componentWillUnmount = () => {
    if (this.subscription != null) this.subscription.unsubscribe();
  }



  render(){
    const { classes } = this.props;
    const { myMasternodes, mnProblems,  anchorEl } = this.state;

    return (
    <div className={classes.root}>
      <Button variant="contained" color="primary" aria-owns={anchorEl ? 'simple-menu' : undefined} aria-haspopup="true" onClick={this.handleClick}>
        My MNs: {
          myMasternodes == null ? 
          "loading" :
          myMasternodes.length - mnProblems + "/" + myMasternodes.length
        }
      </Button>

      <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>

        {
          myMasternodes == null ?
          "" :
          myMasternodes.map(myMn =>
            (
              <MenuItem className={classes.menuItem} onClick={this.handleClose}>
                <ListItemIcon className={classes.icon}>
                  <SendIcon />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.primary }} inset primary={myMn.name} />
              </MenuItem>
            )
          )
        }
      </Menu>
    </div>
      
    );
  }

 
  
}

MyMasternodes.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyMasternodes);


