import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

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
        error: null
    };
  
    this.getMasternodeSubscription = null;
  }


  componentDidMount() {
    const { output } = this.props.match.params

    this.getMasternodeSubscription = BlockchainServices.getMasternode(output).subscribe((masternode) =>{
      this.setState({
        masternode: masternode
      });
    });

  }

  componentWillUnmount() {

    this.getMasternodeSubscription.unsubscribe();
  }



  render(){
    const { output } = this.props.match.params
    const { classes } = this.props;
    const { masternode } = this.state;

    if (masternode == null)
    {
      return null;
    }
    return (
    <div>
      <Header output={output} masternode={masternode}/>
      <Events output={output} masternode={masternode}/>
      <Graph masternode={masternode} />
    </div>
      
    );
  }

  
}

MasternodeDetails.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MasternodeDetails);