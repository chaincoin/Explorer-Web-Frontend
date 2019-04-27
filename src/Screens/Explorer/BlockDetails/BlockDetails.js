import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Header from './BlockDetailsHeader';
import Transactions from './BlockDetailsTransactions';

import BlockchainServices from '../../../Services/BlockchainServices';


const styles = {
  root: {
    
  }
};

class BlockDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        block: null,
        error: null
    };
  
    this.getBlockSubscription = null;
  }


  componentDidMount() {
    const { blockId } = this.props.match.params

    this.getBlockSubscription = BlockchainServices.getBlock(blockId).subscribe((block) =>{
      this.setState({
        block: block
      });
    });

  }

  componentWillUnmount() {

    this.getBlockSubscription.unsubscribe();
  }



  render(){
    const { classes } = this.props;
    const { block } = this.state;

    if (block == null)
    {
      return null;
    }
    return (
    <div>
      <Header block={block}/>
      <Transactions block={block}/>
    </div>
      
    );
  }

  
}

BlockDetails.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BlockDetails);