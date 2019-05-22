import React from 'react';

import { combineLatest } from 'rxjs';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Switch from '@material-ui/core/Switch';


import AddressCoinControl from './AddressCoinControl';

import MyWalletServices from '../../../../Services/MyWalletServices';

const styles = {
  
};

class CoinControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      coinControl: false,
      inputAddresses: [],
      selectedInputsTotal: 0
    };
  
    this.subscription = null;
  }


  componentDidMount() {
    this.subscription = combineLatest(MyWalletServices.inputAddresses, this.props.transaction.coinControl, this.props.transaction.selectedInputsTotal)
      .subscribe(([inputAddresses, coinControl, selectedInputsTotal]) => this.setState({coinControl, inputAddresses, selectedInputsTotal}));
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }



  render(){
    const { classes, transaction } = this.props;
    const { inputAddresses, coinControl, selectedInputsTotal } = this.state;
    
    return (
      <div>
        Coin Control: 
        <Switch
          checked={coinControl}
          onChange={(event) => this.props.transaction.setCoinControl(event.target.checked)}
          color="primary"
        />

        {
          coinControl ? (
            <div> 
              {
                inputAddresses.map(inputAddress =>(
                  <AddressCoinControl inputAddress={inputAddress} transaction={transaction} />
                ))
              }
              <div>
                Input Total: { selectedInputsTotal }
              </div>
            </div>
          ): null
        }
        
      </div>
    );
  }
}



CoinControl.propTypes = {
  classes: PropTypes.object.isRequired,
  controlledAddresses: PropTypes.object.isRequired
};

export default withStyles(styles)(CoinControl);


