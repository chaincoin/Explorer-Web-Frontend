import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';

import ChaincoinIndexerServiceList from './Screens/ChaincoinIndexerServiceList'
import NavBar from './Components/NavBar'
import Header from './Components/Header/Header'

import HomeScreen from './Screens/HomeScreen'

import BlockList from './Screens/Explorer/BlockList'
import BlockDetails from './Screens/Explorer/BlockDetails/BlockDetails'
import TransactionDetails from './Screens/Explorer/TransactionDetails/TransactionDetails'
import AddressDetails from './Screens/Explorer/AddressDetails/AddressDetails'


import ContactMe from './Screens/ContactMe'

import BlockCount from './Components/Header/BlockCount'


const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  }
});


 class App extends React.Component {

  

  render() {
    return <Router>
      <div>
        <NavBar />
        <Header/>

        <Route exact path="/" component={BlockList} />
        <Route exact path="/Explorer/Block/:blockId" component={BlockDetails} />
        <Route exact path="/Explorer/Transaction/:txid" component={TransactionDetails} />
        <Route exact path="/Explorer/Address/:addressId" component={AddressDetails} />

        <Route exact path="/ContactMe" component={ContactMe} />
      </div>
    </Router>;
  }
}


export default withStyles(styles)(App);