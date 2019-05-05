import React from 'react';
import update from 'react-addons-update'; // ES6
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { combineLatest } from 'rxjs';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';



import BlockchainServices from '../../Services/BlockchainServices';
import MyWalletServices from '../../Services/MyWalletServices';

const styles = {
  root: {
   display:"inline"
  }
};

class MyAddresses extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,


      myAddresses: null,
      mnProblem: false
    };

    this.myAddressesSubscription = null;
    this.addressSubscriptions = [];
  }


  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };



  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  componentDidMount() {

    window.addEventListener("resize", this.updateDimensions);
    this.setState({windowWidth: window.innerWidth});


    this.myAddressesSubscription = MyWalletServices.myAddresses.subscribe(myAddresses =>{ //TODO: this could be done better

        this.addressSubscriptions.forEach(v => v.unsubscribe());
        this.setState({
          myAddresses: myAddresses 
        }, () =>{

          this.addressSubscriptions = myAddresses.map((address, index) => {
            return BlockchainServices.getAddress(address.address).subscribe(address =>{
              this.setState({
                myAddresses: update(this.state.myAddresses, {[index]: {data: {$set: address}}})
              })
  
            });
          });

        });
      });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions); 
    this.myAddressesSubscription.unsubscribe();
    this.addressSubscriptions.forEach(v => v.unsubscribe());

  }



  render(){
    const { classes } = this.props;
    const { myAddresses,  anchorEl } = this.state;

    var totalBalance = null; //TODO: use BigDecimal library 

    if (myAddresses != null)
    {
      var balances = myAddresses.map(myAddress => myAddress.data == null ? null : myAddress.data.balance);
      if (balances.indexOf(null) == -1){
        totalBalance = 0;
        balances.forEach(balance => totalBalance = totalBalance + balance);
      }
    }
    

    return (
    <div className={classes.root}>
      <Button variant="contained" color="primary" aria-owns={anchorEl ? 'simple-menu' : undefined} aria-haspopup="true" onClick={this.handleClick}>
        {
          totalBalance == null ? 
          "Balance: Loading ":
          "Balance: " + Math.round(totalBalance) + " chc"
        }
      </Button>

      <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
        {
          myAddresses == null ? 
          "" :
          myAddresses.map(myAddress =>
            (<MenuItem onClick={this.handleClose}>{myAddress.name}: {myAddress.data == null ? "loading" : Math.round(myAddress.data.balance) + " chc"}</MenuItem>)
          )
        }
      </Menu>
    </div>
      
    );
  }

 
  
}

MyAddresses.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAddresses);


