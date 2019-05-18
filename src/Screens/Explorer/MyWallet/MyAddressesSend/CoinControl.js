import React from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';


import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Checkbox from '@material-ui/core/Checkbox';


import { ValidatorForm, SelectValidator} from 'react-material-ui-form-validator';
import Recipients from './Recipients';


import BlockchainServices from '../../../../Services/BlockchainServices';
import MyWalletServices from '../../../../Services/MyWalletServices';

import coinSelect from '../../../../Scripts/coinselect/coinselect'; //https://github.com/bitcoinjs/coinselect
import coinSelectUtils from '../../../../Scripts/coinselect/utils'; //https://github.com/bitcoinjs/coinselect

const styles = {
  
};

class CoinControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedInputs:{},
      selectedInputsTotal: 0
    };
  
  }

 

  componentDidMount() {
    if (this.props.onRef != null) this.props.onRef(this);
    this.props.selectedInputsChange(Object.values(this.state.selectedInputs));
  }


  clear = () =>{

    this.setState({
      selectedInputs:{},
      selectedInputsTotal: 0
    });
    this.props.selectedInputsChange([]);
  }

  renderAddressCoinControl = (controlledAddress) =>
  {

    var allSelected = true;
    if (controlledAddress.unspent != null)
    {
      controlledAddress.unspent.forEach(unspent => {
        if (this.state.selectedInputs[unspent.txid + "-" + unspent.vout] == null) allSelected = false;
      });
    }
    else
    {
      allSelected = false;
    }
    
    const handleInputChange = () =>{
debugger;
      var selectedInputs = Object.values(this.state.selectedInputs);
      var selectedInputsTotal = 0; //TODO: floating point issue
      selectedInputs.forEach(i => selectedInputsTotal = selectedInputsTotal + i.unspent.value);//TODO: floating point issue

      this.setState({selectedInputsTotal:selectedInputsTotal});
      this.props.selectedInputsChange(selectedInputs);
    }

    const handleUnspentChange = (unspent) =>{
      return (event) =>{
        debugger;
        if (event.target.checked) this.state.selectedInputs[unspent.txid + "-" + unspent.vout] = {controlledAddress, unspent};
        else delete this.state.selectedInputs[unspent.txid + "-" + unspent.vout];

        handleInputChange();
      }
    }


    const handleControlledAddressChange = (event) =>{
      if (event.target.checked) controlledAddress.unspent.forEach(unspent => this.state.selectedInputs[unspent.txid + "-" + unspent.vout] = {controlledAddress, unspent});
      else controlledAddress.unspent.forEach(unspent => delete this.state.selectedInputs[unspent.txid + "-" + unspent.vout]);
      
      handleInputChange();
    }

    

    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Checkbox
            checked={allSelected}
            onClick={(e)=> e.stopPropagation()}
            onChange={handleControlledAddressChange}
            color="primary"
          />
        {controlledAddress.controlledAddress.name} {controlledAddress.address.balance}
        
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            {controlledAddress.unspent != null? controlledAddress.unspent.map(unspent => (
              <div>
                <div>
                  <Checkbox
                    checked={this.state.selectedInputs[unspent.txid + "-" + unspent.vout] != null}
                    onChange={handleUnspentChange(unspent)}
                    disabled={this.props.rawMemPool.find(r => r.vin.find(v => v.txid == unspent.txid && v.vout == unspent.vout ))}
                    color="primary"
                  />
                  {unspent.value}
                </div>
              </div>
            )): null}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }


  render(){
    const { classes, controlledAddresses } = this.props;
    const { selectedInputsTotal } = this.state;

    
    return (
      <div>
        {controlledAddresses.map(this.renderAddressCoinControl)}
        <div>
          Input Total: {selectedInputsTotal / 100000000}
        </div>
      </div>
    );
  }
}



CoinControl.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedInputsChange: PropTypes.func.isRequired,
  rawMemPool: PropTypes.object.isRequired,
};

export default withStyles(styles)(CoinControl);



