import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

import { Link } from "react-router-dom";

import BlockchainServices from '../../Services/BlockchainServices';
import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';

const styles = theme => ({
  root: {
   display:"inline"
  },
  button:{
    "text-transform": "initial"
  },
  menuItem: {
    
  },
  primary: {},
  icon: {},
  checkIcon: {color:"green"},
  closeIcon: {color:"red"}
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


    this.subscription = MyWalletServices.myMasternodes.pipe(
      switchMap(myMasternodes =>{
        if (myMasternodes.length == 0) return of([]);
        return combineLatest(myMasternodes.map(myMn => BlockchainServices.masternode(myMn.output).pipe(map(mn =>({myMn, mn})))))
      })
    ).subscribe(
      (rows) =>{
        var mnProblems = false;

        rows.forEach(row =>{
          if (row.mn == null || row.mn.status != "ENABLED") mnProblems = mnProblems + 1;
        });

        this.setState({
          rows: rows,
          mnProblems: mnProblems
        });
      });
  }

  componentWillUnmount = () => {
    this.subscription.unsubscribe();
  }



  render(){
    const { classes } = this.props;
    const { rows, mnProblems,  anchorEl } = this.state;

    return (
    <div className={classes.root}>
      <Button className={classes.button} variant="contained" color="primary" aria-owns={anchorEl ? 'simple-menu' : undefined} aria-haspopup="true" onClick={this.handleClick}>
        {
          mnProblems == false ? 
          (<CheckIcon className={classes.checkIcon}/>):
          (<CloseIcon className={classes.closeIcon}/>)
        }
        
        {
          rows == null ? 
          "loading" :
          rows.length - mnProblems + "/" + rows.length
        }
      </Button>

      <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
        <Link to={"/Explorer/MyWallet/MyMasternodes"}>
          <MenuItem onClick={this.handleClose}>
            My Masternodes
          </MenuItem>
        </Link>
        {
          rows == null ?
          "" :
          rows.map(row =>
            (
              <Link to={"/Explorer/MasternodeList/" + row.myMn.output}>
                <MenuItem className={classes.menuItem} onClick={this.handleClose}>
                  <ListItemIcon className={classes.icon}>
                    {
                      row.mn != null && row.mn.status == "ENABLED" ? 
                      (<CheckIcon className={classes.checkIcon}/>):
                      (<CloseIcon className={classes.closeIcon}/>)
                    }
                  </ListItemIcon>
                  <ListItemText classes={{ primary: classes.primary }} inset primary={row.myMn.name} />
                </MenuItem>
              </Link>
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


