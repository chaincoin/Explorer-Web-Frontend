import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Card, CardBody, CardHeader } from 'reactstrap';

import Header from './MasternodeDetailsHeader';
import Events from './MasternodeDetailsEvents';
import Graph from './MasternodeDetailsGraph';

import BlockchainServices from '../../../Services/BlockchainServices';


const styles = {
  root: {
    
  }
};

class MasternodeDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        masternode: null,
        error: null,

        tab: 0,
    };
  
    this.getMasternodeSubscription = null;
  }

  masternodeSubscribe(){
    const { output } = this.props.match.params

    if (this.getMasternodeSubscription != null) this.getMasternodeSubscription.unsubscribe();
    this.getMasternodeSubscription = BlockchainServices.getMasternode(output).subscribe((masternode) =>{
      this.setState({
        masternode: masternode
      });
    });
  }

  handleTabChange = (event, tab) => {
    this.setState({ tab });
  };

  componentDidMount() {
    this.masternodeSubscribe();
  }

  componentWillUnmount() {
    this.getMasternodeSubscription.unsubscribe();
  }


  componentDidUpdate(prevProps) {
    if (this.props.match.params.output  != prevProps.match.params.output) this.masternodeSubscribe();
  }


  render(){
    const { output } = this.props.match.params
    const { classes } = this.props;
    const { masternode, tab } = this.state;

    if (masternode == null)
    {
      return null;
    }
    return (
    <div>
      <Header output={output} masternode={masternode}/>
      
      <Card>
        <CardHeader>
          <Tabs value={tab} onChange={this.handleTabChange}>
            <Tab label="Events" classes={{ label: 'details-tab' }} />
            <Tab label="Graph" classes={{ label: 'details-tab' }} />
          </Tabs>
        </CardHeader>
        <CardBody>
        {tab === 0 && <Events output={output} masternode={masternode}/>}
        {tab === 1 && <Graph masternode={masternode} />}
        </CardBody> 
      </Card>
    </div>
      
    );
  }

  
}

MasternodeDetails.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MasternodeDetails);