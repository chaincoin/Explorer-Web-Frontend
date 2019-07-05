import React from 'react';
import update from 'react-addons-update'; // ES6
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { combineLatest } from 'rxjs';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import NotificationsNone from '@material-ui/icons/NotificationsNone';
import NotificationsActive from '@material-ui/icons/NotificationsActive';

import { Link, withRouter } from "react-router-dom";

import FirebaseServices from '../../Services/FirebaseServices';

const styles = {
  root: {
   display:"inline"
  },
  button:{
    "text-transform": "initial"
  }
};

class Notifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
      notifications: null
    };

    this.notificationsSubscription = null;
  }


  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };



  handleClose = () => {
    this.setState({ anchorEl: null });
  };


  componentDidMount() {

    this.notificationsSubscription = FirebaseServices.notifications.subscribe((notifications) =>{
      this.setState({notifications:notifications})
    })
  }

  componentWillUnmount() {
    this.notificationsSubscription.unsubscribe();
  }



  render(){
    const { classes } = this.props;
    const { notifications,  anchorEl } = this.state;

    return (
    <div className={classes.root}>
      <Button className={classes.button} variant="contained" color="primary" aria-owns={anchorEl ? 'simple-menu' : undefined} aria-haspopup="true" onClick={this.handleClick}>
        
        {
          notifications == null || notifications.length == 0 ? 
          <NotificationsNone/>:
          <NotificationsActive/>
        }
        {
          notifications == null ? 
          "?":
          notifications.length
        }
      </Button>

      <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
        {
          notifications == null || notifications.length == 0 ? 
          (
            <MenuItem onClick={this.handleClose}>
              Nothing
            </MenuItem>
          ) :
          notifications.map(this.notificationToRow)
        }
        
      </Menu>
    </div>
      
    );
  }

 
  notificationToRow = (notification) => {

    const handleClick = () =>{
      this.handleClose();
      FirebaseServices.removeNotification(notification);
    };

    if (notification.eventType == "newBlock")
    {
      return (
        <Link to={"/Explorer/Block/" + notification.blockHash}>
          <MenuItem onClick={handleClick}>
            new Block ({notification.blockHash})
          </MenuItem>
        </Link>
      )
    }
    else if (notification.eventType == "newAddressTransaction")
    {
      return (
        <Link to={"/Explorer/Address/" + notification.address}>
          <MenuItem onClick={handleClick}>
            new transaction ({notification.address})
          </MenuItem>
        </Link>
      )
    }
    else if (notification.eventType === 'newMasternode')
    {
      return (
        <Link to={"/Explorer/MasternodeList/" + notification.masternodeOutPoint}>
          <MenuItem onClick={handleClick}>
            new Masternode
          </MenuItem>
        </Link>
      )
    }
    else if (notification.eventType === 'changedMasternode' )
    {
      var masternode = JSON.parse(notification.masternode);
      return (
        <Link to={"/Explorer/MasternodeList/" + notification.masternodeOutPoint}>
          <MenuItem onClick={handleClick}>
            masternode status change from {masternode.previousStatus} to {masternode.status}
          </MenuItem>
        </Link>
      )
    }
    else if (notification.eventType === 'removedMasternode' )
    {
      return (
        <Link to={"/Explorer/MasternodeList/" + notification.masternodeOutPoint}>
          <MenuItem onClick={handleClick}>
            removed Masternode
          </MenuItem>
        </Link>
      )
    }
    else if (notification.eventType === 'expiringMasternode')
    {
      return (
        <Link to={"/Explorer/MasternodeList/" + notification.masternodeOutPoint}>
          <MenuItem onClick={handleClick}>
            expiring Masternode
          </MenuItem>
        </Link>
      )
    }
  }
  
}

Notifications.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Notifications));


