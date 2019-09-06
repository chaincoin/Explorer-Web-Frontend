import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Header from './BlockDetailsHeader';
import Transactions from './BlockDetailsTransactions';

import BlockchainServices from '../../../Services/BlockchainServices';
import { ReplaySubject } from 'rxjs';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';




const BlockDetails = (props) =>{

  const blockId = new ReplaySubject();
  const block = blockId.pipe(
    distinctUntilChanged((prev, curr) => prev == curr),
    switchMap(blockId => BlockchainServices.getBlock(blockId))
  )

   

  React.useEffect(() => {
    blockId.next(props.match.params.blockId);
  }, [props.match.params.blockId]); //TODO: should this be using prop change detection

  return (
    <div>
      <Header block={block}/>
      <Transactions block={block}/>
    </div>
  )
}




export default BlockDetails;