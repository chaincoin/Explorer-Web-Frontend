import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';

import MyMasternodeList from './MyMasternodeList';
import MyMasternodesGraph from './MyMasternodesGraph';




const styles = theme => ({
  
});

class MyMasternodes extends React.Component {
  state = {
    tab: 0 
  };

  handleTabChange = (event, tab) => {
    this.setState({ tab });
  };

  render() {
    const { classes } = this.props;
    const { tab } = this.state;

    return (
      <Card>
        <CardHeader>
          <Tabs value={tab} onChange={this.handleTabChange}>
            <Tab label="My Masternodes" classes={{ label: 'details-tab' }} />
            <Tab label="Payouts" classes={{ label: 'details-tab' }} />
          </Tabs>
        </CardHeader>
        <CardBody>
        {tab === 0 && <MyMasternodeList />}
        {tab === 1 && <MyMasternodesGraph />}
        </CardBody> 
      </Card>

    );
  }
}


MyMasternodes.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(MyMasternodes);





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}

