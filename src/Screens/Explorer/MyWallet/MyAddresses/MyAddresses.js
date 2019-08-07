import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";

import MyAddressList from './MyAddressList';
import MyAddressesSend from './MyAddressesSend/MyAddressesSend';
import MyAddressesGraph from './MyAddressesGraph';




const styles = theme => ({
  tabHeader:{
    paddingLeft: "0px",
    paddingRight: "0px",
  }
});

class MyAddresses extends React.Component {
  

  state = {
    tab: 0
  };


  handleTabChange = (event, tab) => {
    this.setState({ tab });
  };
 
  render() {
    const { tab } = this.state;
    const { classes } = this.props;

    return (

      <Card>
        <CardHeader className={classes.tabHeader}>
          <Tabs value={tab} onChange={this.handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="My Addresses" classes={{ label: 'details-tab' }} />
            <Tab label="Send" classes={{ label: 'details-tab' }} />
            <Tab label="Mining" classes={{ label: 'details-tab' }} />
            <Tab label="MN Payouts" classes={{ label: 'details-tab' }} />
          </Tabs>
        </CardHeader>
        <CardBody>
        {tab === 0 && <MyAddressList />}
        {tab === 1 && <MyAddressesSend />}
        {tab === 2 && <MyAddressesGraph  payOutType="miner" />}
        {tab === 3 && <MyAddressesGraph  payOutType="masternode" />}
        </CardBody> 
      </Card>


    );
  }
}


MyAddresses.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(MyAddresses);





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}

