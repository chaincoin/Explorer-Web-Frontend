import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';


import { Card, CardBody, CardHeader } from 'reactstrap';




const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'scroll',
    "-webkit-overflow-scrolling": "touch"
  },
});

class News extends React.Component {
  state = {
    rows: [
      {
        header:"My Masternodes now has payout performance graphs",
        body:"Simple go to <a href=\"\Explorer/MyWallet/MyMasternodes\">My Masternodes</a> and click the graphs tab "
      },
      {
          header:"Chaincoin Faucet - now live",
          body:"Visit <a href=\"https://chc.nodes.mn/faucet/\">https://chc.nodes.mn/faucet/</a> to earn free chc daily. Many thanks to chaoabunga"
      },
      {
          header:"Explorer - My Wallet",
          body:"Chaincoin explorer now has a My Wallet section containing My Addresses and My Masternodes for easy access"
      },
      {
          header:"Chaincoin 0.6.14 MN guide",
          body:"A new guide to creating a chaincoin 0.6.14 MN is now available <a href=\"\Tutorials\">here</a>"
      },
      {
          header:"Chaincoin Explorer's new Server",
          body:"Welcome to my new shiny server from https://www.hetzner.com/<br>A 64 gb ram beast https://www.hetzner.com/dedicated-rootserver/ex42"
      },
      {
          header:"Push Notifications (MainNet only)",
          body:"Google Firebase push notifications to devices, tested with Windows and Android<br>Masternode status changes and expiring pushing notifications"
      },
      {
          header:"MainNet web miner",
          body:"Chaincoin Explorer has successfully mined two blocks on MainNet - <a href=\"http://chaincoinexplorer.co.uk/Explorer/Address/chc1qy2n9qmvp3j6ew2k0prqk2q7h9j3e8wrlgmyea2\" target=\"_blank\">chc1qy2n9qmvp3j6ew2k0prqk2q7h9j3e8wrlgmyea2</a><br>But I didn't realise the monumental event had happened and have spent the CHC :("
      },
      {
          header:"SerfNet web miner",
          body:"Chaincoin Explorer has successfully mined many blocks on SerfNet - <a href=\"http://test.chaincoinexplorer.co.uk/Explorer/Address/tchc1qq03kpt3xpw0vdg6n03g3xurd776g98aclljeph\" target=\"_blank\">tchc1qq03kpt3xpw0vdg6n03g3xurd776g98aclljeph</a>"
      }
    ],
    loading: true, 
    error: null,

  };



  handleChangePage = (event, page) => {
    this.setState({ page });
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

  componentDidMount() {

    
  }

  componentWillUnmount() {
   
  }


  

 
  render() {
    const { rows } = this.state;



    return (

      rows.map(row => (
      <Card>
        <CardHeader>
          {row.header}
        </CardHeader>
        <CardBody dangerouslySetInnerHTML={{__html:row.body}}>
          
        </CardBody>
      </Card>


      ))
      
    );
  }
}


News.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(News);




