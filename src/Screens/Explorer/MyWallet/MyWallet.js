import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { Card, CardBody, CardHeader } from 'reactstrap';

import { Route, withRouter } from "react-router-dom";

import MyAddressList from './MyAddressList';
import MyMasternodeList from './MyMasternodeList';
import MyAddressesSend from './MyAddressesSend/MyAddressesSend';
import MyAddressesGraph from './MyAddressesGraph';
import MyWalletSettings from './MyWalletSettings';




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


  handleTabChange = (event, url) => {
    this.props.history.push(url);
    this.setState({ tab: url });
  };
 
  render() {
    const { tab } = this.state;
    const { classes } = this.props;

    return (

      <Card>
        <CardHeader className={classes.tabHeader}>
          <Tabs value={tab} onChange={this.handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="My Addresses" classes={{ label: 'details-tab' }} value="/Explorer/MyWallet/MyAddresses" />
            <Tab label="My Masternodes" classes={{ label: 'details-tab' }} value="/Explorer/MyWallet/MyMasternodes" />
            <Tab label="Send" classes={{ label: 'details-tab' }} value="/Explorer/MyWallet/Send" />
            <Tab label="Mining Rewards" classes={{ label: 'details-tab' }} value="/Explorer/MyWallet/MiningRewards" />
            <Tab label="Masternode Rewards" classes={{ label: 'details-tab' }} value="/Explorer/MyWallet/MasternodeRewards" />
            <Tab label="My Wallet Settings" classes={{ label: 'details-tab' }} value="/Explorer/MyWallet/MyWalletSettings" />
          </Tabs>
        </CardHeader>
        <CardBody>

        <Route exact path="/Explorer/MyWallet" component={MyAddressList} />
        <Route exact path="/Explorer/MyWallet/MyAddresses" component={MyAddressList} />
        <Route exact path="/Explorer/MyWallet/MyMasternodes" component={MyMasternodeList} />

        <Route exact path="/Explorer/MyWallet/MyAddressesSend" component={MyAddressesSend} />

        <Route exact path="/Explorer/MyWallet/MiningRewards" component={minerRewardsComponent} />
        <Route exact path="/Explorer/MyWallet/MasternodeRewards" component={mnRewardsComponent} />
        
        <Route exact path="/Explorer/MyWallet/MyWalletSettings" component={MyWalletSettings} />

        </CardBody> 
      </Card>


    );
  }
}


const minerRewardsComponent = () => (<MyAddressesGraph  payOutType="miner" />)
const mnRewardsComponent = () => (<MyAddressesGraph  payOutType="masternode" />)

MyAddresses.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(withRouter(MyAddresses));




