import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import { Link } from "react-router-dom";

import MyAddressList from './MyAddressList';
import MyAddressesSend from './MyAddressesSend';
import MyAddressesGraph from './MyAddressesGraph';




const styles = theme => ({

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
        <CardHeader>
          <Tabs value={tab} onChange={this.handleTabChange}>
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

var Chaincoin = {
  messagePrefix: 'DarkCoin Signed Message:\n',
  bip32: {
  public: 0x02FE52F8,
  private: 0x02FE52CC
  },
  bech32: "chc",
  pubKeyHash: 0x1C,
  scriptHash: 0x04,
  wif: 0x9C
};