import React from "react";
import ES6Promise from 'es6-promise'; 
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';

import ChaincoinIndexerServiceList from './Screens/ChaincoinIndexerServiceList'
import NavBar from './Components/NavBar'
import Header from './Components/Header/Header'
import Footer from './Components/Footer/Footer'

import HomeScreen from './Screens/HomeScreen'

import BlockList from './Screens/Explorer/BlockList'
import BlockDetails from './Screens/Explorer/BlockDetails/BlockDetails'
import TransactionDetails from './Screens/Explorer/TransactionDetails/TransactionDetails'
import AddressDetails from './Screens/Explorer/AddressDetails/AddressDetails'

import MasternodeList from './Screens/Explorer/MasternodeList'
import MasternodeDetails from './Screens/Explorer/MasternodeDetails/MasternodeDetails'

import MasternodeWinnersList from './Screens/Explorer/MasternodeWinners'
import MemPool from './Screens/Explorer/MemPool'
import RichList from './Screens/Explorer/RichList'
import PeerList from './Screens/Explorer/PeerList'
import ChainTips from './Screens/Explorer/ChainTips'


import MyAddresses from './Screens/Explorer/MyWallet/MyAddresses'
import MyMasternodes from './Screens/Explorer/MyWallet/MyMasternodes'


import BountyList from './Screens/BountyList'

import Miner from './Screens/Miner'

import Api from './Screens/Api'
import News from './Screens/News'
import Tutorial from './Screens/Tutorials/0.16-MN/Tutorial'
import ContactMe from './Screens/ContactMe'

import NotFound from './Screens/NotFound'

import Environment from './Services/Environment';

import DialogContainer from './Components/DialogContainer'


import liveFavicon from './images/icons/favicon-16x16-Live.png';
import stagingFavicon from './images/icons/favicon-16x16-Staging.png';
import testFavicon from './images/icons/favicon-16x16-Test.png';


import liveAppleTouchIcon60  from './images/icons/apple-icon-60x60-Live.png';
import stagingAppleTouchIcon60  from './images/icons/apple-icon-60x60-Staging.png';
import testAppleTouchIcon60  from './images/icons/apple-icon-60x60-Test.png';


import liveAppleTouchIcon72  from './images/icons/apple-icon-72x72-Live.png';
import stagingAppleTouchIcon72  from './images/icons/apple-icon-72x72-Staging.png';
import testAppleTouchIcon72  from './images/icons/apple-icon-72x72-Test.png';

import liveAppleTouchIcon76  from './images/icons/apple-icon-76x76-Live.png';
import stagingAppleTouchIcon76  from './images/icons/apple-icon-76x76-Staging.png';
import testAppleTouchIcon76  from './images/icons/apple-icon-76x76-Test.png';


import liveAppleTouchIcon114  from './images/icons/apple-icon-114x114-Live.png';
import stagingAppleTouchIcon114 from './images/icons/apple-icon-114x114-Staging.png';
import testAppleTouchIcon114  from './images/icons/apple-icon-114x114-Test.png';


import liveAppleTouchIcon120  from './images/icons/apple-icon-120x120-Live.png';
import stagingAppleTouchIcon120 from './images/icons/apple-icon-120x120-Staging.png';
import testAppleTouchIcon120 from './images/icons/apple-icon-120x120-Test.png';



ES6Promise.polyfill();

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  }
});


 class App extends React.Component {

  componentDidMount() {



  }

  componentWillUnmount() {
    
  }


  render() {
    return <Router>
      <div>
        <Helmet>
          <title>{
            Environment.environment == "Live" ? 
            "Chaincoin Explorer" :
            "Chaincoin Explorer - " + Environment.environment
          }</title>
          
          {
            Environment.environment == "Live" ? 
            "Chaincoin Explorer" :
            "Chaincoin Explorer - " + Environment.environment
          }
          
          {{
            Live: <link rel="shortcut icon" href={liveFavicon} />,
            Staging: <link rel="shortcut icon" href={stagingFavicon} />,
            Test: <link rel="shortcut icon" href={testFavicon} />,
          }[Environment.environment]}


          
          {{
            Live: <link rel="apple-touch-icon" sizes="60x60" href={liveAppleTouchIcon60} />,
            Staging: <link rel="apple-touch-icon" sizes="60x60" href={stagingAppleTouchIcon60} />,
            Test: <link rel="apple-touch-icon" sizes="60x60" href={testAppleTouchIcon60} />,
          }[Environment.environment]}


          {{
            Live: <link rel="apple-touch-icon" sizes="72x72" href={liveAppleTouchIcon72} />,
            Staging: <link rel="apple-touch-icon" sizes="72x72" href={stagingAppleTouchIcon72} />,
            Test: <link rel="apple-touch-icon" sizes="72x72" href={testAppleTouchIcon72} />,
          }[Environment.environment]}

          {{
            Live: <link rel="apple-touch-icon" sizes="76x76" href={liveAppleTouchIcon76} />,
            Staging: <link rel="apple-touch-icon" sizes="76x76" href={stagingAppleTouchIcon76} />,
            Test: <link rel="apple-touch-icon" sizes="76x76" href={testAppleTouchIcon76} />,
          }[Environment.environment]}


          {{
            Live: <link rel="apple-touch-icon" sizes="114x114" href={liveAppleTouchIcon114} />,
            Staging: <link rel="apple-touch-icon" sizes="114x114" href={stagingAppleTouchIcon114} />,
            Test: <link rel="apple-touch-icon" sizes="114x114" href={testAppleTouchIcon114} />,
          }[Environment.environment]}


          {{
            Live: <link rel="apple-touch-icon" sizes="120x120" href={liveAppleTouchIcon120} />,
            Staging: <link rel="apple-touch-icon" sizes="120x120" href={stagingAppleTouchIcon120} />,
            Test: <link rel="apple-touch-icon" sizes="120x120" href={testAppleTouchIcon120} />,
          }[Environment.environment]}
                    
        </Helmet>
        <NavBar />
        <Header/>

        <div className="Content">
            
          <Route exact path="/" component={BlockList} />
          <Route exact path="/Explorer" component={BlockList} />
          <Route exact path="/Explorer/Block/:blockId" component={BlockDetails} />
          <Route exact path="/Explorer/Transaction/:txid" component={TransactionDetails} />
          <Route exact path="/Explorer/Address/:addressId" component={AddressDetails} />
          <Route exact path="/Explorer/MasternodeList/" component={MasternodeList} />
          <Route exact path="/Explorer/MasternodeList/:output" component={MasternodeDetails} />
          <Route exact path="/Explorer/MasternodeWinnersList" component={MasternodeWinnersList} />
          
          <Route exact path="/Explorer/MemPool" component={MemPool} />
          <Route exact path="/Explorer/RichList" component={RichList} />
          <Route exact path="/Explorer/PeerList" component={PeerList} />
          <Route exact path="/Explorer/ChainTips" component={ChainTips} />
          
          <Route exact path="/Explorer/MyWallet/MyAddresses" component={MyAddresses} />
          <Route exact path="/Explorer/MyWallet/MyMasternodes" component={MyMasternodes} />
          
          
          <Route exact path="/Miner" component={Miner} />
          <Route exact path="/BountyList" component={BountyList} />

          <Route exact path="/Api" component={Api} />
          <Route exact path="/News" component={News} />
          <Route exact path="/Tutorials" component={Tutorial} />
          <Route exact path="/ContactMe" component={ContactMe} />

          <Route exact path="/NotFound/:searchInput" component={NotFound} />
          
        
        </div>
        <Footer/>
        <DialogContainer/>
      </div>
    </Router>;
  }
}


export default withStyles(styles)(App);